import { getRecommendations } from '../app/utils/recommendations';

describe('Recommendations', () => {
  it('returns curated apps for a given category', async () => {
    const apps = await getRecommendations('productivity');
    expect(apps.length).toBeGreaterThan(0);
    expect(apps[0]).toHaveProperty('name');
  });
});
