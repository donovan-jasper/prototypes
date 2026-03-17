import { create } from 'zustand';

interface FileMetadata {
  id: string;
  name: string;
  size: number;
  rowCount: number;
  importedAt: string;
}

interface FilesStore {
  files: FileMetadata[];
  addFile: (file: FileMetadata) => void;
  removeFile: (id: string) => void;
  getFile: (id: string) => FileMetadata | undefined;
}

export const useFilesStore = create<FilesStore>((set, get) => ({
  files: [],
  addFile: (file) => set((state) => ({ files: [...state.files, file] })),
  removeFile: (id) => set((state) => ({ files: state.files.filter(f => f.id !== id) })),
  getFile: (id) => get().files.find(f => f.id === id)
}));
