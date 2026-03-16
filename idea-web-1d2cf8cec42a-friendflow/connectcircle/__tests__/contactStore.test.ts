import { useContactStore } from '../store/contactStore';

describe('Contact Store', () => {
  beforeEach(() => {
    useContactStore.setState({ contacts: [] });
  });

  test('adds contact to store', () => {
    const { addContact, contacts } = useContactStore.getState();
    addContact({
      id: '1',
      name: 'Dave',
      frequency: 14,
      lastContact: new Date(),
    });
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe('Dave');
  });

  test('updates last contact date', () => {
    const { addContact, updateLastContact, contacts } = useContactStore.getState();
    addContact({ id: '1', name: 'Eve', frequency: 7, lastContact: new Date('2026-03-01') });
    updateLastContact('1', new Date('2026-03-16'));
    expect(contacts[0].lastContact.getDate()).toBe(16);
  });
});
