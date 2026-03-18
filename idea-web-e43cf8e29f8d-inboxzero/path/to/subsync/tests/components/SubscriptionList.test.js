import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SubscriptionList from '../SubscriptionList';

describe('SubscriptionList', () => {
  it('renders a list of subscriptions', () => {
    const subscriptions = [
      { id: 1, name: 'Newsletter 1' },
      { id: 2, name: 'Newsletter 2' },
    ];
    const { getByText } = render(<SubscriptionList subscriptions={subscriptions} />);
    expect(getByText('Newsletter 1')).toBeTruthy();
    expect(getByText('Newsletter 2')).toBeTruthy();
  });

  it('calls the unsubscribe function when the unsubscribe button is pressed', () => {
    const unsubscribe = jest.fn();
    const subscriptions = [
      { id: 1, name: 'Newsletter 1' },
    ];
    const { getByText } = render(<SubscriptionList subscriptions={subscriptions} unsubscribe={unsubscribe} />);
    const unsubscribeButton = getByText('Unsubscribe');
    fireEvent.press(unsubscribeButton);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
