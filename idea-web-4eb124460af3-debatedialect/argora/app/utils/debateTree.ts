interface DebateNode {
  id: string;
  title: string;
  type: 'root' | 'pro' | 'con';
  children: DebateNode[];
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
    children: [],
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
  type: 'pro' | 'con'
): DebateTree => {
  const parent = tree.nodes[parentId];
  if (!parent) {
    throw new Error('Parent node not found');
  }

  const newNode: DebateNode = {
    id: Date.now().toString(),
    title,
    type,
    children: [],
  };

  parent.children.push(newNode);
  tree.nodes[newNode.id] = newNode;

  return tree;
};
