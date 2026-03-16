import { calculateSplit } from '../../lib/stripe';

describe('Stripe', () => {
  it('should calculate equal split correctly', () => {
    const mockOrder = {
      items: [
        { name: 'Item 1', price: 10, quantity: 2 },
        { name: 'Item 2', price: 5, quantity: 1 },
      ],
      participants: [
        { id: 1, name: 'Participant 1' },
        { id: 2, name: 'Participant 2' },
      ],
    };

    const split = calculateSplit(mockOrder, 'equal');
    expect(split.total).toBe(25);
    expect(split.perPerson).toBe(12.5);
    expect(split.participants[0].amount).toBe(12.5);
    expect(split.participants[1].amount).toBe(12.5);
  });
});
