import { findAvailableSlots, suggestTaskTime, adaptRoutine } from '../lib/scheduler';
import { addHours, startOfDay, setHours, setMinutes } from 'date-fns';
import { Task, ScheduleBlock, Routine } from '../types';

describe('Scheduler', () => {
  describe('findAvailableSlots', () => {
    test('finds available slots between commitments', () => {
      const today = startOfDay(new Date());
      const commitments: ScheduleBlock[] = [
        {
          id: '1',
          title: 'Work',
          startTime: addHours(today, 9),
          endTime: addHours(today, 17),
          type: 'work',
        },
      ];
      
      const slots = findAvailableSlots(today, commitments);
      
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].start.getHours()).toBeLessThan(9); // Morning slot
      expect(slots[slots.length - 1].end.getHours()).toBeGreaterThan(17); // Evening slot
    });

    test('handles multiple commitments', () => {
      const today = startOfDay(new Date());
      const commitments: ScheduleBlock[] = [
        {
          id: '1',
          title: 'Morning meeting',
          startTime: addHours(today, 9),
          endTime: addHours(today, 10),
          type: 'work',
        },
        {
          id: '2',
          title: 'Lunch',
          startTime: addHours(today, 12),
          endTime: addHours(today, 13),
          type: 'personal',
        },
      ];
      
      const slots = findAvailableSlots(today, commitments);
      
      expect(slots.length).toBeGreaterThanOrEqual(3); // Before 9am, 10am-12pm, after 1pm
      
      // Check for slot between meetings
      const midMorningSlot = slots.find(
        (slot) => slot.start.getHours() === 10 && slot.end.getHours() === 12
      );
      expect(midMorningSlot).toBeDefined();
    });

    test('returns full day when no commitments', () => {
      const today = startOfDay(new Date());
      const slots = findAvailableSlots(today, []);
      
      expect(slots.length).toBe(1);
      expect(slots[0].start).toEqual(today);
    });
  });

  describe('suggestTaskTime', () => {
    test('suggests task time based on priority and duration', () => {
      const today = startOfDay(new Date());
      const task: Task = {
        id: '1',
        title: 'Call dentist',
        priority: 'high',
        estimatedMinutes: 15,
        completed: false,
        timeConstraints: { businessHours: true },
        createdAt: new Date(),
      };
      
      const commitments: ScheduleBlock[] = [
        {
          id: '1',
          title: 'Afternoon meeting',
          startTime: addHours(today, 13),
          endTime: addHours(today, 17),
          type: 'work',
        },
      ];
      
      const suggestion = suggestTaskTime(task, today, commitments);
      
      expect(suggestion).toBeDefined();
      expect(suggestion!.getHours()).toBeGreaterThanOrEqual(9);
      expect(suggestion!.getHours()).toBeLessThan(13);
    });

    test('respects business hours constraint', () => {
      const today = startOfDay(new Date());
      const task: Task = {
        id: '1',
        title: 'Call bank',
        priority: 'medium',
        estimatedMinutes: 20,
        completed: false,
        timeConstraints: { businessHours: true },
        createdAt: new Date(),
      };
      
      const commitments: ScheduleBlock[] = [];
      
      const suggestion = suggestTaskTime(task, today, commitments);
      
      expect(suggestion).toBeDefined();
      expect(suggestion!.getHours()).toBeGreaterThanOrEqual(9);
      expect(suggestion!.getHours()).toBeLessThan(17);
    });

    test('respects preferred time window', () => {
      const today = startOfDay(new Date());
      const task: Task = {
        id: '1',
        title: 'Workout',
        priority: 'medium',
        estimatedMinutes: 60,
        completed: false,
        timeConstraints: {
          preferredTimeWindow: { start: 6, end: 8 },
        },
        createdAt: new Date(),
      };
      
      const commitments: ScheduleBlock[] = [];
      
      const suggestion = suggestTaskTime(task, today, commitments);
      
      expect(suggestion).toBeDefined();
      expect(suggestion!.getHours()).toBeGreaterThanOrEqual(6);
      expect(suggestion!.getHours()).toBeLessThan(8);
    });

    test('returns null when no viable slots', () => {
      const today = startOfDay(new Date());
      const task: Task = {
        id: '1',
        title: 'Long task',
        priority: 'low',
        estimatedMinutes: 480, // 8 hours
        completed: false,
        createdAt: new Date(),
      };
      
      const commitments: ScheduleBlock[] = [
        {
          id: '1',
          title: 'All day event',
          startTime: addHours(today, 0),
          endTime: addHours(today, 23),
          type: 'work',
        },
      ];
      
      const suggestion = suggestTaskTime(task, today, commitments);
      
      expect(suggestion).toBeNull();
    });

    test('high priority tasks get earliest slot', () => {
      const today = startOfDay(new Date());
      const highPriorityTask: Task = {
        id: '1',
        title: 'Urgent task',
        priority: 'high',
        estimatedMinutes: 30,
        completed: false,
        createdAt: new Date(),
      };
      
      const commitments: ScheduleBlock[] = [
        {
          id: '1',
          title: 'Meeting',
          startTime: addHours(today, 14),
          endTime: addHours(today, 15),
          type: 'work',
        },
      ];
      
      const suggestion = suggestTaskTime(highPriorityTask, today, commitments);
      
      expect(suggestion).toBeDefined();
      expect(suggestion!.getHours()).toBeLessThan(14);
    });

    test('low priority tasks get later slot', () => {
      const today = startOfDay(new Date());
      const lowPriorityTask: Task = {
        id: '1',
        title: 'Optional task',
        priority: 'low',
        estimatedMinutes: 30,
        completed: false,
        createdAt: new Date(),
      };
      
      const commitments: ScheduleBlock[] = [];
      
      const suggestion = suggestTaskTime(lowPriorityTask, today, commitments);
      
      expect(suggestion).toBeDefined();
      expect(suggestion!.getHours()).toBeGreaterThanOrEqual(15);
    });
  });

  describe('adaptRoutine', () => {
    test('adapts routine timing to fit around commitments', () => {
      const routine: Routine = {
        id: '1',
        name: 'Morning routine',
        tasks: ['Shower', 'Breakfast', 'Review day'],
        flexible: true,
        preferredTimeWindow: { start: 6, end: 10 },
        streak: 0,
      };
      
      const schedule: ScheduleBlock[] = [
        {
          id: '1',
          title: 'Early meeting',
          startTime: setMinutes(setHours(new Date(), 7), 0),
          endTime: setMinutes(setHours(new Date(), 8), 0),
          type: 'work',
        },
      ];
      
      const suggestion = adaptRoutine(routine, schedule);
      
      expect(suggestion).toBeDefined();
      expect(suggestion!.getHours()).toBeGreaterThanOrEqual(6);
      expect(suggestion!.getHours()).toBeLessThan(10);
    });

    test('returns null for non-flexible routines', () => {
      const routine: Routine = {
        id: '1',
        name: 'Fixed routine',
        tasks: ['Task 1'],
        flexible: false,
        streak: 0,
      };
      
      const schedule: ScheduleBlock[] = [];
      
      const suggestion = adaptRoutine(routine, schedule);
      
      expect(suggestion).toBeNull();
    });

    test('finds earliest slot when preferred window is blocked', () => {
      const routine: Routine = {
        id: '1',
        name: 'Evening routine',
        tasks: ['Dinner', 'Relax'],
        flexible: true,
        preferredTimeWindow: { start: 18, end: 20 },
        streak: 0,
      };
      
      const schedule: ScheduleBlock[] = [
        {
          id: '1',
          title: 'Evening event',
          startTime: setMinutes(setHours(new Date(), 18), 0),
          endTime: setMinutes(setHours(new Date(), 21), 0),
          type: 'personal',
        },
      ];
      
      const suggestion = adaptRoutine(routine, schedule);
      
      expect(suggestion).toBeDefined();
      // Should suggest time before or after the blocked window
      const hour = suggestion!.getHours();
      expect(hour < 18 || hour >= 21).toBe(true);
    });
  });
});
