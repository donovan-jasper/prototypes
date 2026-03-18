import { getSubscriptions, unsubscribe } from '../SubscriptionService';

describe('SubscriptionService', () => {
  it('gets a list of subscriptions', async () => {
    const subscriptions = await getSubscriptions();
    expect(subscriptions).toBeInstanceOf(Array);
  });

  it('unsubscribes from a subscription', async () => {
    const id = 1;
    const result = await unsubscribe(id);
    expect(result).toBeInstanceOf(Object);
  });
});
