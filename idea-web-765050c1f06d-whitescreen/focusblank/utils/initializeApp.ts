import { openDatabase, createTables, isFocusModesEmpty, saveFocusMode, getFocusModes, getWidgetPositions } from './database';
import { focusModes } from '../constants/focusModes';
import useAppStore from '../store/useAppStore';

export const initializeApp = async () => {
  try {
    const db = await openDatabase();
    
    await createTables(db);
    
    const isEmpty = await isFocusModesEmpty(db);
    
    if (isEmpty) {
      for (const mode of focusModes) {
        await saveFocusMode(db, mode);
      }
    }
    
    const modes = await getFocusModes(db);
    const widgets = await getWidgetPositions(db);
    
    useAppStore.setState({ focusModes: modes, widgets: widgets as any });
    
  } catch (error) {
    console.error('Failed to initialize app:', error);
  }
};
