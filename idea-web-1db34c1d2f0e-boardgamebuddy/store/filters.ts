import { create } from 'zustand';

type TimeRange = 'any' | 'today' | 'this-week';

interface FiltersState {
  selectedHobbies: string[];
  timeRange: TimeRange;
  setSelectedHobbies: (hobbies: string[]) => void;
  setTimeRange: (range: TimeRange) => void;
  toggleHobby: (hobby: string) => void;
}

export const useFilters = create<FiltersState>((set) => ({
  selectedHobbies: [],
  timeRange: 'any',

  setSelectedHobbies: (hobbies) => set({ selectedHobbies: hobbies }),
  setTimeRange: (range) => set({ timeRange: range }),

  toggleHobby: (hobby) =>
    set((state) => {
      const index = state.selectedHobbies.indexOf(hobby);
      if (index === -1) {
        return { selectedHobbies: [...state.selectedHobbies, hobby] };
      } else {
        return {
          selectedHobbies: state.selectedHobbies.filter((h) => h !== hobby),
        };
      }
    }),
}));
