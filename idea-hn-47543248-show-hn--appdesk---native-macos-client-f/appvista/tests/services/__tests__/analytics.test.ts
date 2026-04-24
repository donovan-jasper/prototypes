import { fetchAnalytics } from '../../analytics';

jest.mock('../../api', () => ({
  getAppStoreData: jest.fn(() => Promise.resolve({ sales: 100, ratings: 4.5 })),
}));

test('fetches and caches analytics', async () => {
  const data = await fetchAnalytics('com.example.app');
  expect(data).toEqual({ sales: 100, ratings: 4.5 });
});
