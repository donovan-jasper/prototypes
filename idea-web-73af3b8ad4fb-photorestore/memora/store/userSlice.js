import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isPremium: false,
  usageCount: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    incrementUsage: (state) => {
      state.usageCount += 1;
    },
    upgradeToPremium: (state) => {
      state.isPremium = true;
    },
  },
});

export const { incrementUsage, upgradeToPremium } = userSlice.actions;
export default userSlice.reducer;
