import { createClient } from '@supabase/supabase-js';
import { getModes, saveMode } from './database';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export const syncUp = async (userId) => {
  const modes = await getModes();
  const { data, error } = await supabase
    .from('modes')
    .upsert(modes.map(mode => ({ ...mode, userId })));

  if (error) {
    console.error('Error syncing up:', error);
  }
};

export const syncDown = async (userId) => {
  const { data: modes, error } = await supabase
    .from('modes')
    .select('*')
    .eq('userId', userId);

  if (error) {
    console.error('Error syncing down:', error);
    return;
  }

  for (const mode of modes) {
    await saveMode(mode);
  }
};
