import { swipeToArchive, swipeToMute, swipeToPin, swipeToDelete } from '../app/utils/swipeActions';

test('swipeToArchive marks item as archived', () => {
  const item = { id: 1, archived: false };
  const result = swipeToArchive(item);
  expect(result.archived).toBe(true);
});

test('swipeToMute marks item as muted', () => {
  const item = { id: 1, muted: false };
  const result = swipeToMute(item);
  expect(result.muted).toBe(true);
});

test('swipeToPin marks item as pinned', () => {
  const item = { id: 1, pinned: false };
  const result = swipeToPin(item);
  expect(result.pinned).toBe(true);
});

test('swipeToDelete marks item as deleted', () => {
  const item = { id: 1, deleted: false };
  const result = swipeToDelete(item);
  expect(result.deleted).toBe(true);
});
