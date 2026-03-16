import { render, fireEvent } from '@testing-library/react-native';
import SessionTimer from '../components/SessionTimer';

describe('SessionTimer', () => {
  it('renders with initial duration', () => {
    const { getByText } = render(<SessionTimer duration={25} />);
    expect(getByText('25:00')).toBeTruthy();
  });

  it('calls onComplete when timer finishes', () => {
    const onComplete = jest.fn();
    const { getByTestId } = render(
      <SessionTimer duration={0.01} onComplete={onComplete} />
    );
    setTimeout(() => {
      expect(onComplete).toHaveBeenCalled();
    }, 1000);
  });
});
