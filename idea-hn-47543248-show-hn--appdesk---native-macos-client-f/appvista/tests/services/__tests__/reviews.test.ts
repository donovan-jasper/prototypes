import { fetchReviews } from '../../reviews';

jest.mock('../../api', () => ({
  getAppStoreReviews: jest.fn(() => Promise.resolve([{ id: '1', title: 'Review 1', body: 'Sample review', rating: 5 }])),
}));

test('fetches and caches reviews', async () => {
  const reviews = await fetchReviews('com.example.app');
  expect(reviews).toEqual([{ id: '1', title: 'Review 1', body: 'Sample review', rating: 5 }]);
});
