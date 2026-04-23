export interface ArgumentNode {
  id: string;
  title: string;
  type: 'pro' | 'con' | 'root';
  votes: {
    up: number;
    down: number;
  };
  evidence?: string;
  children: ArgumentNode[];
}

export interface DebateTree {
  root: ArgumentNode;
  nodes: Record<string, ArgumentNode>;
}

export const buildDebateTree = (rootTitle: string): DebateTree => {
  const rootId = generateId();
  const rootNode: ArgumentNode = {
    id: rootId,
    title: rootTitle,
    type: 'root',
    votes: { up: 0, down: 0 },
    children: [],
  };

  return {
    root: rootNode,
    nodes: {
      [rootId]: rootNode,
    },
  };
};

export const addArgument = (
  tree: DebateTree,
  parentId: string,
  title: string,
  type: 'pro' | 'con',
  evidence?: string
): ArgumentNode => {
  const parent = tree.nodes[parentId];
  if (!parent) {
    throw new Error('Parent node not found');
  }

  const newNode: ArgumentNode = {
    id: generateId(),
    title,
    type,
    votes: { up: 0, down: 0 },
    evidence,
    children: [],
  };

  parent.children.push(newNode);
  tree.nodes[newNode.id] = newNode;
  return newNode;
};

export const voteOnArgument = (
  tree: DebateTree,
  argumentId: string,
  voteType: 'up' | 'down'
): void => {
  const node = tree.nodes[argumentId];
  if (!node) {
    throw new Error('Argument not found');
  }

  node.votes[voteType]++;
};

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
