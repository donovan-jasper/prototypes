import { render, fireEvent } from '@testing-library/react-native';
import Home from '../../app/screens/Home';

test('runs a query flow', () => {
  const { getByText, getByPlaceholderText } = render(<Home />);

  // Simulate voice input
  fireEvent.press(getByText('Start Listening'));

  // Simulate query input
  const queryInput = getByPlaceholderText('Enter your SQL query');
  fireEvent.changeText(queryInput, 'SELECT * FROM sales;');

  // Simulate query execution
  fireEvent.press(getByText('Run Query'));

  // Verify results
  expect(getByText('Results')).toBeTruthy();
});
