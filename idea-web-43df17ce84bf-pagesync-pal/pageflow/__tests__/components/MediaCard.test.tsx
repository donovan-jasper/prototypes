import { render } from '@testing-library/react-native';
import MediaCard from '../../components/MediaCard';

describe('MediaCard component', () => {
  test('renders media title and progress', () => {
    const { getByText } = render(
      <MediaCard
        media={{
          id: 'test1',
          title: 'Dune',
          type: 'book',
          currentProgress: 200,
          totalProgress: 412,
          unit: 'page',
          lastUpdated: new Date(),
        }}
      />
    );
    expect(getByText('Dune')).toBeTruthy();
    expect(getByText('48%')).toBeTruthy();
  });
});
