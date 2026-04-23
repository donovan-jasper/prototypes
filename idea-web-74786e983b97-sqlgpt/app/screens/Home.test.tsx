import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from './Home';
import useSQLExecutor from '../hooks/useSQLExecutor';
import useSQLParser from '../hooks/useSQLParser';

// Mock the hooks
jest.mock('../hooks/useSQLExecutor');
jest.mock('../hooks/useSQLParser');

describe('Home Screen', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<Home />);
    expect(getByText('QueryMentor')).toBeTruthy();
  });

  it('displays loading state when executing query', async () => {
    const mockExecuteQuery = jest.fn().mockResolvedValue({
      columns: ['id', 'product', 'amount'],
      rows: [[1, 'Widget A', 100.50]]
    });

    (useSQLExecutor as jest.Mock).mockReturnValue({
      executeQuery: mockExecuteQuery,
      result: null,
      isLoading: true
    });

    const { getByText } = render(<Home />);

    // Simulate speech input
    const voiceInput = getByText('Speak to search');
    fireEvent.press(voiceInput);

    await waitFor(() => {
      expect(getByText('Executing query...')).toBeTruthy();
    });
  });

  it('displays query results', async () => {
    const mockResult = {
      columns: ['id', 'product', 'amount'],
      rows: [[1, 'Widget A', 100.50]]
    };

    (useSQLExecutor as jest.Mock).mockReturnValue({
      executeQuery: jest.fn().mockResolvedValue(mockResult),
      result: mockResult,
      isLoading: false
    });

    const { getByText } = render(<Home />);

    await waitFor(() => {
      expect(getByText('Query Results:')).toBeTruthy();
      expect(getByText('id')).toBeTruthy();
      expect(getByText('product')).toBeTruthy();
      expect(getByText('amount')).toBeTruthy();
      expect(getByText('1')).toBeTruthy();
      expect(getByText('Widget A')).toBeTruthy();
      expect(getByText('100.5')).toBeTruthy();
    });
  });
});
