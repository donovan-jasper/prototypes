import { calculateRelationshipScore, getOverdueContacts } from '../lib/analytics';

describe('Analytics', () => {
  test('calculates relationship score correctly', () => {
    const contact = {
      id: '1',
      name: 'Alice',
      lastContact: new Date('2026-03-10'),
      frequency: 7, // days
    };
    const score = calculateRelationshipScore(contact, new Date('2026-03-16'));
    expect(score).toBeGreaterThan(0);
  });

  test('identifies overdue contacts', () => {
    const contacts = [
      { id: '1', name: 'Bob', lastContact: new Date('2026-02-01'), frequency: 30 },
      { id: '2', name: 'Carol', lastContact: new Date('2026-03-15'), frequency: 7 },
    ];
    const overdue = getOverdueContacts(contacts, new Date('2026-03-16'));
    expect(overdue).toHaveLength(1);
    expect(overdue[0].name).toBe('Bob');
  });
});
