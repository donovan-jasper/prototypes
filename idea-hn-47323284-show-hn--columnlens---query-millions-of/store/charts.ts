import create from 'zustand';

export const useChartStore = create((set) => ({
  charts: [],
  saveChart: (chart) => set((state) => ({ charts: [...state.charts, chart] })),
  deleteChart: (id) => set((state) => ({ charts: state.charts.filter((chart) => chart.id !== id) })),
}));
