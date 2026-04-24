import { create } from 'zustand';
import { getAllWorkflows, saveWorkflow, getWorkflowById, createWorkflow } from '../lib/storage/workflows';
import { Workflow } from '../lib/storage/workflows';

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

interface WorkflowState {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  selectedNodeId: string | null;
  isLoading: boolean;
  error: string | null;

  loadWorkflows: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  createNewWorkflow: (name: string, description: string) => Promise<void>;
  updateWorkflow: (workflow: Workflow) => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  addNode: (node: NodeData) => void;
  updateNode: (nodeId: string, updates: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  addConnection: (from: string, to: string) => void;
  deleteConnection: (from: string, to: string) => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  currentWorkflow: null,
  selectedNodeId: null,
  isLoading: false,
  error: null,

  loadWorkflows: async () => {
    try {
      set({ isLoading: true, error: null });
      const workflows = await getAllWorkflows();
      set({ workflows, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load workflows', isLoading: false });
    }
  },

  loadWorkflow: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const workflow = await getWorkflowById(id);
      if (workflow) {
        set({ currentWorkflow: workflow, isLoading: false });
      } else {
        set({ error: 'Workflow not found', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load workflow', isLoading: false });
    }
  },

  createNewWorkflow: async (name: string, description: string) => {
    try {
      set({ isLoading: true, error: null });
      const newWorkflow = await createWorkflow(name, description);
      set((state) => ({
        workflows: [newWorkflow, ...state.workflows],
        currentWorkflow: newWorkflow,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create workflow', isLoading: false });
    }
  },

  updateWorkflow: async (workflow: Workflow) => {
    try {
      set({ isLoading: true, error: null });
      await saveWorkflow(workflow);
      set((state) => ({
        currentWorkflow: workflow,
        workflows: state.workflows.map(w =>
          w.id === workflow.id ? workflow : w
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to save workflow', isLoading: false });
    }
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  addNode: (node: NodeData) => {
    set((state) => {
      if (!state.currentWorkflow) return state;

      const newWorkflow = {
        ...state.currentWorkflow,
        nodes: [...state.currentWorkflow.nodes, node],
      };

      // Auto-save after adding node
      get().updateWorkflow(newWorkflow);

      return {
        currentWorkflow: newWorkflow,
        selectedNodeId: node.id,
      };
    });
  },

  updateNode: (nodeId: string, updates: Partial<NodeData>) => {
    set((state) => {
      if (!state.currentWorkflow) return state;

      const newNodes = state.currentWorkflow.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      );

      const newWorkflow = {
        ...state.currentWorkflow,
        nodes: newNodes,
      };

      // Auto-save after updating node
      get().updateWorkflow(newWorkflow);

      return {
        currentWorkflow: newWorkflow,
      };
    });
  },

  deleteNode: (nodeId: string) => {
    set((state) => {
      if (!state.currentWorkflow) return state;

      // Remove node and any connections involving it
      const newNodes = state.currentWorkflow.nodes.filter(node => node.id !== nodeId);
      const newConnections = state.currentWorkflow.connections.filter(
        conn => conn.from !== nodeId && conn.to !== nodeId
      );

      const newWorkflow = {
        ...state.currentWorkflow,
        nodes: newNodes,
        connections: newConnections,
      };

      // Auto-save after deleting node
      get().updateWorkflow(newWorkflow);

      return {
        currentWorkflow: newWorkflow,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      };
    });
  },

  addConnection: (from: string, to: string) => {
    set((state) => {
      if (!state.currentWorkflow) return state;

      // Check if connection already exists
      const exists = state.currentWorkflow.connections.some(
        conn => conn.from === from && conn.to === to
      );

      if (exists) return state;

      const newConnections = [...state.currentWorkflow.connections, { from, to }];

      const newWorkflow = {
        ...state.currentWorkflow,
        connections: newConnections,
      };

      // Auto-save after adding connection
      get().updateWorkflow(newWorkflow);

      return {
        currentWorkflow: newWorkflow,
      };
    });
  },

  deleteConnection: (from: string, to: string) => {
    set((state) => {
      if (!state.currentWorkflow) return state;

      const newConnections = state.currentWorkflow.connections.filter(
        conn => !(conn.from === from && conn.to === to)
      );

      const newWorkflow = {
        ...state.currentWorkflow,
        connections: newConnections,
      };

      // Auto-save after deleting connection
      get().updateWorkflow(newWorkflow);

      return {
        currentWorkflow: newWorkflow,
      };
    });
  },
}));
