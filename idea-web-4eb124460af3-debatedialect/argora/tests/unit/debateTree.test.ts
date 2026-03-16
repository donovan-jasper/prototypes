import { buildDebateTree, addArgument } from '../../app/utils/debateTree';

test('buildDebateTree creates a root node', () => {
  const tree = buildDebateTree('Main Topic');
  expect(tree.root.title).toBe('Main Topic');
});

test('addArgument appends to the correct parent', () => {
  const tree = buildDebateTree('Main Topic');
  addArgument(tree, 'root', 'Pro Argument', 'pro');
  expect(tree.root.children[0].title).toBe('Pro Argument');
});
