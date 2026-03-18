interface Evidence {
  type: 'link' | 'image' | 'pdf';
  url: string;
  title: string;
}

interface DebateNode {
  id: string;
  title: string;
  type: 'root' | 'pro' | 'con';
  votes: number;
  children: DebateNode[];
  evidence: Evidence[];
}

interface DebateTree {
  root: DebateNode;
  nodes: Record<string, DebateNode>;
}

export const buildDebateTree = (rootTitle: string): DebateTree => {
  const root: DebateNode = {
    id: 'root',
    title: rootTitle,
    type: 'root',
    votes: 0,
    children: [],
    evidence: [],
  };

  return {
    root,
    nodes: { root },
  };
};

export const addArgument = (
  tree: DebateTree,
  parentId: string,
  title: string,
  type: 'pro' | 'con',
  evidence?: Evidence[]
): DebateTree => {
  const parent = tree.nodes[parentId];
  if (!parent) {
    throw new Error('Parent node not found');
  }

  const newNode: DebateNode = {
    id: Date.now().toString(),
    title,
    type,
    votes: 0,
    children: [],
    evidence: evidence || [],
  };

  parent.children.push(newNode);
  tree.nodes[newNode.id] = newNode;

  return tree;
};

export const updateVotes = (
  tree: DebateTree,
  nodeId: string,
  delta: number
): DebateTree => {
  const node = tree.nodes[nodeId];
  if (!node) {
    throw new Error('Node not found');
  }

  node.votes += delta;
  return tree;
};

export type { DebateNode, DebateTree, Evidence };
