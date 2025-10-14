import { create } from 'zustand';

export interface AnalysisFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  selectedCoins: string[];
  tradeTypes: string[];
}

interface FilterState {
  filters: AnalysisFilters;
  setDateRange: (start: Date, end: Date) => void;
  setSelectedCoins: (coins: string[]) => void;
  setTradeTypes: (types: string[]) => void;
  resetFilters: () => void;
}

const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30); // 최근 30일
  return { start, end };
};

export const useFilterStore = create<FilterState>((set) => ({
  filters: {
    dateRange: getDefaultDateRange(),
    selectedCoins: [],
    tradeTypes: [],
  },
  setDateRange: (start, end) =>
    set((state) => ({
      filters: { ...state.filters, dateRange: { start, end } },
    })),
  setSelectedCoins: (coins) =>
    set((state) => ({
      filters: { ...state.filters, selectedCoins: coins },
    })),
  setTradeTypes: (types) =>
    set((state) => ({
      filters: { ...state.filters, tradeTypes: types },
    })),
  resetFilters: () =>
    set({
      filters: {
        dateRange: getDefaultDateRange(),
        selectedCoins: [],
        tradeTypes: [],
      },
    }),
}));
