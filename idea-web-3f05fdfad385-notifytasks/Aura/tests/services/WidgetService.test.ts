import { WidgetService } from '../../src/services/WidgetService';
import { Task } from '../../src/types/TaskTypes';

jest.mock('expo-application');

describe('WidgetService', () => {
  const mockTasks: Task[] = [
    {
      id: 1,
      content: 'Task 1',
      type: 'task',
      isCompleted: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPremium: false,
    },
    {
      id: 2,
      content: 'Task 2',
      type: 'task',
      isCompleted: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPremium: false,
    },
  ];

  it('triggers update for all Home Screen widgets', async () => {
    await WidgetService.updateHomeWidgets(mockTasks);

    // Add assertions for platform-specific widget update logic
  });

  it('updates content for iOS Live Activity', async () => {
    await WidgetService.updateLiveActivity(mockTasks[0]);

    // Add assertions for Live Activity update logic
  });

  it('ensures data is correctly formatted and sent for widget display', async () => {
    await WidgetService.sendDataToWidget(mockTasks);

    // Add assertions for data formatting and sending logic
  });
});
