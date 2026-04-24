import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RepositorySelectionScreen from '../src/screens/RepositorySelectionScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Octokit } from '@octokit/rest';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Octokit
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: jest.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'test-repo-1',
          full_name: 'user/test-repo-1',
          description: 'Test repository 1',
          stargazers_count: 10,
        },
        {
          id: 2,
          name: 'test-repo-2',
          full_name: 'user/test-repo-2',
          description: 'Test repository 2',
          stargazers_count: 5,
        },
      ],
    }),
  })),
}));

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('RepositorySelectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('test-token');
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<RepositorySelectionScreen />);
    expect(getByText('Loading your repositories...')).toBeTruthy();
  });

  it('displays repositories after loading', async () => {
    const { getByText, getByPlaceholderText } = render(<RepositorySelectionScreen />);

    await waitFor(() => {
      expect(getByText('test-repo-1')).toBeTruthy();
      expect(getByText('test-repo-2')).toBeTruthy();
    });

    expect(getByPlaceholderText('Search repositories...')).toBeTruthy();
  });

  it('filters repositories based on search query', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<RepositorySelectionScreen />);

    await waitFor(() => {
      expect(getByText('test-repo-1')).toBeTruthy();
      expect(getByText('test-repo-2')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search repositories...');
    fireEvent.changeText(searchInput, 'repo-1');

    await waitFor(() => {
      expect(getByText('test-repo-1')).toBeTruthy();
      expect(queryByText('test-repo-2')).toBeNull();
    });
  });

  it('navigates to IssueList when repository is selected', async () => {
    const { getByText } = render(<RepositorySelectionScreen />);

    await waitFor(() => {
      fireEvent.press(getByText('test-repo-1'));
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('selectedRepository', 'user/test-repo-1');
    expect(mockNavigate).toHaveBeenCalledWith('IssueList', { repo: 'user/test-repo-1' });
  });

  it('shows no results message when search returns nothing', async () => {
    const { getByText, getByPlaceholderText } = render(<RepositorySelectionScreen />);

    await waitFor(() => {
      expect(getByText('test-repo-1')).toBeTruthy();
    });

    const searchInput = getByPlaceholderText('Search repositories...');
    fireEvent.changeText(searchInput, 'nonexistent-repo');

    await waitFor(() => {
      expect(getByText('No repositories found')).toBeTruthy();
    });
  });
});
