import { render, fireEvent } from '@testing-library/react-native';
import DatabaseCard from '@/components/DatabaseCard';

describe('DatabaseCard', () => {
  test('renders database info correctly', () => {
    const db = { id: '1', name: 'Production', type: 'postgresql', lastSync: new Date() };
    const { getByText } = render(<DatabaseCard database={db} onPress={() => {}} />);
    expect(getByText('Production')).toBeTruthy();
    expect(getByText('postgresql')).toBeTruthy();
  });

  test('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const db = { id: '1', name: 'Test', type: 'mysql', lastSync: new Date() };
    const { getByTestId } = render(<DatabaseCard database={db} onPress={onPress} />);
    fireEvent.press(getByTestId('database-card'));
    expect(onPress).toHaveBeenCalledWith('1');
  });
});
