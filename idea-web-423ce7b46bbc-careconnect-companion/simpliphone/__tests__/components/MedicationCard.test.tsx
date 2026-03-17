import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MedicationCard from '../../components/MedicationCard';
import { SettingsProvider } from '../../contexts/SettingsContext';

describe('MedicationCard', () => {
  const medication = {
    id: 1,
    name: 'Aspirin',
    dosage: '1 tablet',
    schedule: '08:00',
    photo: null,
    nextDose: 'Today at 8:00 AM',
  };

  it('renders correctly', () => {
    const { getByText } = render(
      <SettingsProvider>
        <MedicationCard medication={medication} onTakeNow={() => {}} onSkip={() => {}} onSnooze={() => {}} />
      </SettingsProvider>
    );
    expect(getByText('Aspirin')).toBeTruthy();
    expect(getByText('1 tablet')).toBeTruthy();
    expect(getByText('Next dose: Today at 8:00 AM')).toBeTruthy();
  });

  it('calls onTakeNow when take now button is pressed', () => {
    const onTakeNow = jest.fn();
    const { getByText } = render(
      <SettingsProvider>
        <MedicationCard medication={medication} onTakeNow={onTakeNow} onSkip={() => {}} onSnooze={() => {}} />
      </SettingsProvider>
    );
    fireEvent.press(getByText('Take Now'));
    expect(onTakeNow).toHaveBeenCalled();
  });

  it('calls onSkip when skipped button is pressed', () => {
    const onSkip = jest.fn();
    const { getByText } = render(
      <SettingsProvider>
        <MedicationCard medication={medication} onTakeNow={() => {}} onSkip={onSkip} onSnooze={() => {}} />
      </SettingsProvider>
    );
    fireEvent.press(getByText('Skipped'));
    expect(onSkip).toHaveBeenCalled();
  });

  it('calls onSnooze when snooze button is pressed', () => {
    const onSnooze = jest.fn();
    const { getByText } = render(
      <SettingsProvider>
        <MedicationCard medication={medication} onTakeNow={() => {}} onSkip={() => {}} onSnooze={onSnooze} />
      </SettingsProvider>
    );
    fireEvent.press(getByText('Snooze 15min'));
    expect(onSnooze).toHaveBeenCalled();
  });
});
