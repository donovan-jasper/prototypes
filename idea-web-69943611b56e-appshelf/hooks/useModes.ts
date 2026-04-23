import { useAppStore } from '../store/appStore';
import { initDatabase, saveMode, getModes, deleteMode as dbDeleteMode } from '../lib/database';

export const useModes = () => {
  const { modes, addMode, updateMode, deleteMode, setActiveMode } = useAppStore();

  const loadModes = async () => {
    await initDatabase();
    const savedModes = await getModes();
    savedModes.forEach(mode => addMode(mode));
  };

  const createMode = async (modeData: Omit<Mode, 'id'>) => {
    const newMode = {
      ...modeData,
      id: Date.now().toString(),
    };
    await saveMode(newMode);
    addMode(newMode);
    return newMode;
  };

  const updateExistingMode = async (mode: Mode) => {
    await saveMode(mode);
    updateMode(mode);
  };

  const removeMode = async (modeId: string) => {
    await dbDeleteMode(modeId);
    deleteMode(modeId);
  };

  return {
    modes,
    loadModes,
    createMode,
    updateMode: updateExistingMode,
    deleteMode: removeMode,
  };
};
