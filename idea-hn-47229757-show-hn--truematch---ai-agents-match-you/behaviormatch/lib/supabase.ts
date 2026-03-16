import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const uploadBehaviorVector = async (userId, vectorData) => {
  const { data, error } = await supabase
    .from('behavior_vectors')
    .upsert({
      user_id: userId,
      vector_data: vectorData,
    });

  if (error) throw error;
  return data;
};

export const getPotentialMatches = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('user_id', userId);

  if (error) throw error;
  return data;
};

export const createMatchRecord = async (userId, matchedUserId, compatibilityScore) => {
  const { data, error } = await supabase
    .from('matches')
    .insert({
      user_id: userId,
      matched_user_id: matchedUserId,
      compatibility_score: compatibilityScore,
      status: 'pending',
    });

  if (error) throw error;
  return data;
};

export const updateMatchStatus = async (matchId, status) => {
  const { data, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', matchId);

  if (error) throw error;
  return data;
};

export const subscribeToMatches = (userId, callback) => {
  return supabase
    .channel('matches_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};
