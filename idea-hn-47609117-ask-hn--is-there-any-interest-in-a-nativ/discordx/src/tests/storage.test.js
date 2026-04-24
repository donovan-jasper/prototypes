import { saveMessageOffline, getOfflineMessages } from '../storage';

test('saves and retrieves offline messages', async () => {
  const testMsg = { id: '1', text: 'Hello' };
  await saveMessageOffline(testMsg);
  const messages = await getOfflineMessages();
  expect(messages).toContainEqual(testMsg);
});
