import { buildDebateTree, addArgument, updateVotes } from '../../app/utils/debateTree';

test('buildDebateTree creates a root node', () => {
  const tree = buildDebateTree('Main Topic');
  expect(tree.root.title).toBe('Main Topic');
  expect(tree.root.votes).toBe(0);
  expect(tree.root.evidence).toEqual([]);
});

test('addArgument appends to the correct parent', () => {
  const tree = buildDebateTree('Main Topic');
  addArgument(tree, 'root', 'Pro Argument', 'pro');
  expect(tree.root.children[0].title).toBe('Pro Argument');
  expect(tree.root.children[0].votes).toBe(0);
  expect(tree.root.children[0].evidence).toEqual([]);
});

test('addArgument can add nested replies', () => {
  const tree = buildDebateTree('Main Topic');
  addArgument(tree, 'root', 'Pro Argument', 'pro');
  const childId = tree.root.children[0].id;
  addArgument(tree, childId, 'Counter Argument', 'con');
  expect(tree.root.children[0].children[0].title).toBe('Counter Argument');
});

test('addArgument can include evidence', () => {
  const tree = buildDebateTree('Main Topic');
  const evidence = [
    { type: 'link' as const, url: 'https://example.com', title: 'Example Source' },
    { type: 'pdf' as const, url: 'https://example.com/doc.pdf', title: 'Research Paper' },
  ];
  addArgument(tree, 'root', 'Pro Argument', 'pro', evidence);
  expect(tree.root.children[0].evidence).toEqual(evidence);
  expect(tree.root.children[0].evidence.length).toBe(2);
});

test('updateVotes modifies vote count', () => {
  const tree = buildDebateTree('Main Topic');
  updateVotes(tree, 'root', 1);
  expect(tree.root.votes).toBe(1);
  updateVotes(tree, 'root', -1);
  expect(tree.root.votes).toBe(0);
});
