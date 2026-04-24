import { renderHook } from '@testing-library/react-hooks';
import useGitHubIssues from '../src/hooks/useGitHubIssues';

jest.mock('react-native-github-api', () => {
  return {
    GitHub: jest.fn().mockImplementation(() => ({
      getIssues: jest.fn().mockReturnValue({
        listIssues: jest.fn().mockResolvedValue({
          data: [
            { id: '1', title: 'Issue 1', state: 'open' },
            { id: '2', title: 'Issue 2', state: 'closed' },
          ],
        }),
      }),
    })),
  };
});

test('fetches issues from GitHub API', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useGitHubIssues('owner/repo'));

  expect(result.current.loading).toBe(true);

  await waitForNextUpdate();

  expect(result.current.loading).toBe(false);
  expect(result.current.issues).toHaveLength(2);
  expect(result.current.issues[0].title).toBe('Issue 1');
});
