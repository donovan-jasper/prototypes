import { create } from 'zustand';
import { CanvasElement } from '@/lib/drawing';

interface DrawingState {
  elements: CanvasElement[];
  currentTool: string;
  currentColor: string;
  strokeWidth: number;
  undoStack: CanvasElement[][];
  redoStack: CanvasElement[][];
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  addElements: (elements: CanvasElement[]) => void;
  setCurrentTool: (tool: string) => void;
  setCurrentColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  elements: [],
  currentTool: 'pen',
  currentColor: 'black',
  strokeWidth: 2,
  undoStack: [],
  redoStack: [],
  setElements: (elements) => set({ elements }),
  addElement: (element) => set((state) => ({
    elements: [...state.elements, element],
    undoStack: [...state.undoStack, state.elements],
    redoStack: [],
  })),
  addElements: (elements) => set((state) => ({
    elements: [...state.elements, ...elements],
    undoStack: [...state.undoStack, state.elements],
    redoStack: [],
  })),
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setCurrentColor: (color) => set({ currentColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  undo: () => set((state) => {
    if (state.undoStack.length === 0) return state;
    const previousElements = state.undoStack[state.undoStack.length - 1];
    return {
      elements: previousElements,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, state.elements],
    };
  }),
  redo: () => set((state) => {
    if (state.redoStack.length === 0) return state;
    const nextElements = state.redoStack[state.redoStack.length - 1];
    return {
      elements: nextElements,
      undoStack: [...state.undoStack, state.elements],
      redoStack: state.redoStack.slice(0, -1),
    };
  }),
}));
