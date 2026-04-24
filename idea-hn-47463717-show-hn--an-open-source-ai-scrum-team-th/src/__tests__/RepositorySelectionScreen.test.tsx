import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RepositorySelectionScreen from '../screens/RepositorySelectionScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Octokit } from '@octokit/rest';

// Mock the dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@octokit/rest');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

describe('RepositorySelectionScreen', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock AsyncStorage
    AsyncStorage.getItem.mockResolvedValue('test-token');

    // Mock Octokit
    const mockOctokit = {
      request: jest.fn().mockResolvedValue({
        data: [
          {
            id: 1,
            name: 'repo1',
            full_name: 'user/repo1',
            description: 'Test repository 1',
            stargazers_count: 10,
          },
          {
            id: 2,
            name: 'repo2',
            full_name: 'user/repo2',
            description: 'Test repository 2',
            stargazers_count: 5,
          },
        ],
      }),
    };
    Octokit.mockImplementation(() => mockOctokit);
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<RepositorySelectionScreen />);
    expect(getByText('Loading your repositories...')).toBeTruthy();
  });

  it('displays repositories after loading', async () => {
    const { getByText, queryByText } = render(<RepositorySelectionScreen />);

    await waitFor(() => {
      expect(queryByText('Loading your repositories...')).toBeNull();
    });

    expect(getByText('repo1')).toBeTruthy();
    expect(getByText('repo2')).toBeTruthy();
  });

  it('filters repositories based on search query', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(<RepositorySelectionScreen />);

    await waitFor(() => {
      expect(queryByText('Loading your repositories...')).toBeNull();
    });

    const searchInput = getByPlaceholderText('Search repositories...');
    fireEvent.changeText(searchInput, 'repo1');

    expect(getByText('repo1')).toBeTruthy();
    expect(queryByText('repo2')).toBeNull();
  });

  it('navigates to IssueList when a repository is selected', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate,
    });

    const { getByText } = render(<RepositorySelectionScreen />);

    await waitFor(() => {
      expect(getByText('repo1')).toBeTruthy();
    });

    fireEvent.press(getByText('repo1'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('IssueList', { repo: 'user/repo1' });
    });
  });
});
