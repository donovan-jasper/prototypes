import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllWorkflows, saveWorkflow, deleteWorkflow } from '../lib/storage/workflows';
import { saveVersion } from '../lib/storage/versions';

interface NodeData {
  id: string;
  type: 'trigger' | 'ai' | 'action';
  label: string;
  x: number;
  y: number;
  config?: Record<string, any>;
  outputType?: 'text' | 'image' | 'audio' | 'number';
  inputType?: 'text' | 'image' | 'audio' | 'number';
}

interface Connection {
  from: string;
  to: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  connections: Connection[];
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  selectedNodeId: string | null;
  isLoading: boolean;
  error: string | null;

  loadWorkflows: () => Promise<void>;
  createWorkflow: (name: string) => Promise<void>;
  selectWorkflow: (workflowId: string) => void;
  updateWorkflow: (workflow: Workflow) => Promise<void>;
  deleteWorkflow: (workflowId: string) => Promise<void>;
  addNode: (node: NodeData) => void;
  updateNode: (nodeId: string, updates: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  moveNode: (nodeId: string, x: number, y: number) => void;
  addConnection: (from: string, to: string) => void;
  deleteConnection: (from: string, to: string) => void;
  selectNode: (nodeId: string | null) => void;
  validateConnection: (fromNode: NodeData, toNode: NodeData) => boolean;
  checkForCircularReference: (fromNodeId: string, toNodeId: string) => boolean;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      currentWorkflow: null,
      selectedNodeId: null,
      isLoading: false,
      error: null,

      loadWorkflows: async () => {
        set({ isLoading: true, error: null });
        try {
          const workflows = await getAllWorkflows();
          set({ workflows, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load workflows', isLoading: false });
        }
      },

      createWorkflow: async (name: string) => {
        const newWorkflow: Workflow = {
          id: Date.now().toString(),
          name,
          description: '',
          nodes: [],
          connections: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        try {
          await saveWorkflow(newWorkflow);
          set((state) => ({
            workflows: [...state.workflows, newWorkflow],
            currentWorkflow: newWorkflow,
          }));
        } catch (error) {
          set({ error: 'Failed to create workflow' });
        }
      },

      selectWorkflow: (workflowId: string) => {
        const workflow = get().workflows.find(w => w.id === workflowId);
        if (workflow) {
          set({ currentWorkflow: workflow, selectedNodeId: null });
        }
      },

      updateWorkflow: async (workflow: Workflow) => {
        try {
          const updatedWorkflow = {
            ...workflow,
            updatedAt: new Date(),
          };

          await saveWorkflow(updatedWorkflow);
          await saveVersion(updatedWorkflow.id, updatedWorkflow);

          set((state) => ({
            workflows: state.workflows.map(w =>
              w.id === updatedWorkflow.id ? updatedWorkflow : w
            ),
            currentWorkflow: updatedWorkflow,
          }));
        } catch (error) {
          set({ error: 'Failed to update workflow' });
        }
      },

      deleteWorkflow: async (workflowId: string) => {
        try {
          await deleteWorkflow(workflowId);
          set((state) => ({
            workflows: state.workflows.filter(w => w.id !== workflowId),
            currentWorkflow: state.currentWorkflow?.id === workflowId
              ? null
              : state.currentWorkflow,
          }));
        } catch (error) {
          set({ error: 'Failed to delete workflow' });
        }
      },

      addNode: (node: NodeData) => {
        set((state) => {
          if (!state.currentWorkflow) return state;

          const updatedWorkflow = {
            ...state.currentWorkflow,
            nodes: [...state.currentWorkflow.nodes, node],
          };

          get().updateWorkflow(updatedWorkflow);

          return {
            currentWorkflow: updatedWorkflow,
            selectedNodeId: node.id,
          };
        });
      },

      updateNode: (nodeId: string, updates: Partial<NodeData>) => {
        set((state) => {
          if (!state.currentWorkflow) return state;

          const updatedNodes = state.currentWorkflow.nodes.map(node =>
            node.id === nodeId ? { ...node, ...updates } : node
          );

          const updatedWorkflow = {
            ...state.currentWorkflow,
            nodes: updatedNodes,
          };

          get().updateWorkflow(updatedWorkflow);

          return {
            currentWorkflow: updatedWorkflow,
          };
        });
      },

      deleteNode: (nodeId: string) => {
        set((state) => {
          if (!state.currentWorkflow) return state;

          // Remove the node
          const updatedNodes = state.currentWorkflow.nodes.filter(node => node.id !== nodeId);

          // Remove any connections involving this node
          const updatedConnections = state.currentWorkflow.connections.filter(
            conn => conn.from !== nodeId && conn.to !== nodeId
          );

          const updatedWorkflow = {
            ...state.currentWorkflow,
            nodes: updatedNodes,
            connections: updatedConnections,
          };

          get().updateWorkflow(updatedWorkflow);

          return {
            currentWorkflow: updatedWorkflow,
            selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
          };
        });
      },

      moveNode: (nodeId: string, x: number, y: number) => {
        set((state) => {
          if (!state.currentWorkflow) return state;

          const updatedNodes = state.currentWorkflow.nodes.map(node =>
            node.id === nodeId ? { ...node, x, y } : node
          );

          const updatedWorkflow = {
            ...state.currentWorkflow,
            nodes: updatedNodes,
          };

          get().updateWorkflow(updatedWorkflow);

          return {
            currentWorkflow: updatedWorkflow,
          };
        });
      },

      addConnection: (from: string, to: string) => {
        set((state) => {
          if (!state.currentWorkflow) return state;

          // Check if connection already exists
          const connectionExists = state.currentWorkflow.connections.some(
            conn => conn.from === from && conn.to === to
          );

          if (connectionExists) return state;

          const updatedConnections = [
            ...state.currentWorkflow.connections,
            { from, to }
          ];

          const updatedWorkflow = {
            ...state.currentWorkflow,
            connections: updatedConnections,
          };

          get().updateWorkflow(updatedWorkflow);

          return {
            currentWorkflow: updatedWorkflow,
          };
        });
      },

      deleteConnection: (from: string, to: string) => {
        set((state) => {
          if (!state.currentWorkflow) return state;

          const updatedConnections = state.currentWorkflow.connections.filter(
            conn => !(conn.from === from && conn.to === to)
          );

          const updatedWorkflow = {
            ...state.currentWorkflow,
            connections: updatedConnections,
          };

          get().updateWorkflow(updatedWorkflow);

          return {
            currentWorkflow: updatedWorkflow,
          };
        });
      },

      selectNode: (nodeId: string | null) => {
        set({ selectedNodeId: nodeId });
      },

      validateConnection: (fromNode: NodeData, toNode: NodeData) => {
        // Check if output type matches input type
        if (fromNode.outputType && toNode.inputType) {
          return fromNode.outputType === toNode.inputType;
        }
        return true; // If no type specified, allow connection
      },

      checkForCircularReference: (fromNodeId: string, toNodeId: string) => {
        const state = get();
        if (!state.currentWorkflow) return false;

        // Create a map of node connections
        const connectionMap: Record<string, string[]> = {};

        // Initialize the map with all nodes
        state.currentWorkflow.nodes.forEach(node => {
          connectionMap[node.id] = [];
        });

        // Populate the map with connections
        state.currentWorkflow.connections.forEach(conn => {
          if (!connectionMap[conn.from]) {
            connectionMap[conn.from] = [];
          }
          connectionMap[conn.from].push(conn.to);
        });

        // Check for circular reference using DFS
        const visited = new Set<string>();
        const stack: string[] = [toNodeId];

        while (stack.length > 0) {
          const currentNode = stack.pop()!;

          if (currentNode === fromNodeId) {
            return true; // Circular reference found
          }

          if (!visited.has(currentNode)) {
            visited.add(currentNode);
            if (connectionMap[currentNode]) {
              stack.push(...connectionMap[currentNode]);
            }
          }
        }

        return false;
      },
    }),
    {
      name: 'workflow-storage',
      partialize: (state) => ({
        workflows: state.workflows,
        currentWorkflow: state.currentWorkflow,
      }),
    }
  )
);
