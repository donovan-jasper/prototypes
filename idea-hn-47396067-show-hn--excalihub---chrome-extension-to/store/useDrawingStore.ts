import { create } from 'zustand';
import { CanvasElement } from '../types/drawing';

type DrawingState = {
  elements: CanvasElement[];
  undoStack: CanvasElement[][];
  redoStack: CanvasElement[][];
  currentTool: 'pen' | 'rect' | 'circle' | 'line' | 'text' | 'select';
  currentColor: string;
  currentStrokeWidth: number;
  addElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  removeElement: (id: string) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  undo: () => void;
  redo: () => void;
  setTool: (tool: DrawingState['currentTool']) => void;
  setColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
};

export const useDrawingStore = create<DrawingState>((set) => ({
  elements: [],
  undoStack: [],
  redoStack: [],
  currentTool: 'pen',
  currentColor: '#000000',
  currentStrokeWidth: 2,

  addElements: (elements) =>
    set((state) => {
      const newElements = [...state.elements, ...elements];
      return {
        elements: newElements,
        undoStack: [...state.undoStack, state.elements],
        redoStack: [],
      };
    }),

  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
      undoStack: [...state.undoStack, state.elements],
      redoStack: [],
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      undoStack: [...state.undoStack, state.elements],
      redoStack: [],
    })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      undoStack: [...state.undoStack, state.elements],
      redoStack: [],
    })),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;

      const previousState = state.undoStack[state.undoStack.length - 1];
      return {
        elements: previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.elements],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;

      const nextState = state.redoStack[state.redoStack.length - 1];
      return {
        elements: nextState,
        undoStack: [...state.undoStack, state.elements],
        redoStack: state.redoStack.slice(0, -1),
      };
    }),

  setTool: (tool) => set({ currentTool: tool }),
  setColor: (color) => set({ currentColor: color }),
  setStrokeWidth: (width) => set({ currentStrokeWidth: width }),
}));
