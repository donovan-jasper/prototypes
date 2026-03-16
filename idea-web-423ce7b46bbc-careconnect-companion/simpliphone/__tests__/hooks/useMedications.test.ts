import { renderHook, act } from '@testing-library/react-hooks';
import { useMedications } from '../../hooks/useMedications';
import * as medicationsDB from '../../database/medications';

jest.mock('../../database/medications');

describe('useMedications', () => {
  it('loads medications correctly', async () => {
    const mockMedications = [
      { id: 1, name: 'Aspirin', dosage: '1 tablet', schedule: '08:00', photo: null },
    ];
    medicationsDB.getMedications.mockResolvedValue(mockMedications);

    const { result, waitForNextUpdate } = renderHook(() => useMedications());

    act(() => {
      result.current.loadMedications();
    });

    await waitForNextUpdate();

    expect(result.current.medications).toEqual(mockMedications);
  });

  it('adds a new medication correctly', async () => {
    const mockMedication = { id: 1, name: 'Aspirin', dosage: '1 tablet', schedule: '08:00', photo: null };
    medicationsDB.addMedication.mockResolvedValue(1);
    medicationsDB.getMedications.mockResolvedValue([mockMedication]);

    const { result, waitForNextUpdate } = renderHook(() => useMedications());

    act(() => {
      result.current.addNewMedication('Aspirin', '1 tablet', '08:00', null);
    });

    await waitForNextUpdate();

    expect(result.current.medications).toEqual([mockMedication]);
  });
});
