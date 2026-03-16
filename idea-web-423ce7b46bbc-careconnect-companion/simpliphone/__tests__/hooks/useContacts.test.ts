import { renderHook, act } from '@testing-library/react-hooks';
import { useContacts } from '../../hooks/useContacts';
import * as contactsDB from '../../database/contacts';

jest.mock('../../database/contacts');

describe('useContacts', () => {
  it('loads contacts correctly', async () => {
    const mockContacts = [
      { id: 1, name: 'John Doe', phone: '1234567890', photo: null, isFavorite: true, isEmergency: false },
    ];
    contactsDB.getContacts.mockResolvedValue(mockContacts);

    const { result, waitForNextUpdate } = renderHook(() => useContacts());

    act(() => {
      result.current.loadContacts();
    });

    await waitForNextUpdate();

    expect(result.current.contacts).toEqual(mockContacts);
  });

  it('adds a new contact correctly', async () => {
    const mockContact = { id: 1, name: 'John Doe', phone: '1234567890', photo: null, isFavorite: true, isEmergency: false };
    contactsDB.addContact.mockResolvedValue(1);
    contactsDB.getContacts.mockResolvedValue([mockContact]);

    const { result, waitForNextUpdate } = renderHook(() => useContacts());

    act(() => {
      result.current.addNewContact('John Doe', '1234567890', null, true, false);
    });

    await waitForNextUpdate();

    expect(result.current.contacts).toEqual([mockContact]);
  });
});
