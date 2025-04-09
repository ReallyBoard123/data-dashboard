// store/useDataStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimeSeriesData, TimeSeriesRecord, LayoutData } from '../lib/data/types';

interface DataState {
  // Raw data
  timeSeriesData: TimeSeriesData | null;
  layoutData: LayoutData | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Processed data
  filteredRecords: TimeSeriesRecord[];
  
  // Filter states
  dateRange: [string, string] | null;
  selectedEmployees: string[];
  selectedRegions: string[];
  selectedActivities: string[];
  
  // Actions
  setTimeSeriesData: (data: TimeSeriesData) => void;
  setLayoutData: (data: LayoutData) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setDateRange: (range: [string, string] | null) => void;
  setSelectedEmployees: (employees: string[]) => void;
  setSelectedRegions: (regions: string[]) => void;
  setSelectedActivities: (activities: string[]) => void;
  resetFilters: () => void;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initial state
      timeSeriesData: null,
      layoutData: null,
      isLoading: false,
      error: null,
      filteredRecords: [],
      dateRange: null,
      selectedEmployees: [],
      selectedRegions: [],
      selectedActivities: [],
      
      // Actions
      setTimeSeriesData: (data) => {
        set({ 
          timeSeriesData: data,
          filteredRecords: data.records,
        });
        
        // Initialize filters with all available options if not already set
        const state = get();
        if (state.selectedEmployees.length === 0) {
          const uniqueEmployees = Array.from(new Set(data.records.map(r => r.id)));
          set({ selectedEmployees: uniqueEmployees });
        }
        
        if (state.selectedRegions.length === 0) {
          const uniqueRegions = Array.from(new Set(data.records.map(r => r.region)));
          set({ selectedRegions: uniqueRegions });
        }
        
        if (state.selectedActivities.length === 0) {
          const uniqueActivities = Array.from(new Set(data.records.map(r => r.activity)));
          set({ selectedActivities: uniqueActivities });
        }
        
        if (state.dateRange === null) {
          set({ 
            dateRange: [data.metadata.dateRange.start, data.metadata.dateRange.end] 
          });
        }
        
        // Apply filters
        get().applyFilters();
      },
      
      setLayoutData: (data) => {
        set({ layoutData: data });
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      setError: (error) => {
        set({ error });
      },
      
      setDateRange: (range) => {
        set({ dateRange: range });
        get().applyFilters();
      },
      
      setSelectedEmployees: (employees) => {
        set({ selectedEmployees: employees });
        get().applyFilters();
      },
      
      setSelectedRegions: (regions) => {
        set({ selectedRegions: regions });
        get().applyFilters();
      },
      
      setSelectedActivities: (activities) => {
        set({ selectedActivities: activities });
        get().applyFilters();
      },
      
      resetFilters: () => {
        const { timeSeriesData } = get();
        if (!timeSeriesData) return;
        
        const uniqueEmployees = Array.from(new Set(timeSeriesData.records.map(r => r.id)));
        const uniqueRegions = Array.from(new Set(timeSeriesData.records.map(r => r.region)));
        const uniqueActivities = Array.from(new Set(timeSeriesData.records.map(r => r.activity)));
        
        set({
          dateRange: [timeSeriesData.metadata.dateRange.start, timeSeriesData.metadata.dateRange.end],
          selectedEmployees: uniqueEmployees,
          selectedRegions: uniqueRegions,
          selectedActivities: uniqueActivities,
        });
        
        get().applyFilters();
      },
      
      applyFilters: () => {
        const { timeSeriesData, dateRange, selectedEmployees, selectedRegions, selectedActivities } = get();
        
        if (!timeSeriesData) return;
        
        let filtered = timeSeriesData.records;
        
        // Apply date range filter
        if (dateRange) {
          const [startDate, endDate] = dateRange;
          filtered = filtered.filter(record => {
            return record.date >= startDate && record.date <= endDate;
          });
        }
        
        // Apply employee filter
        if (selectedEmployees.length > 0) {
          filtered = filtered.filter(record => selectedEmployees.includes(record.id));
        }
        
        // Apply region filter
        if (selectedRegions.length > 0) {
          filtered = filtered.filter(record => selectedRegions.includes(record.region));
        }
        
        // Apply activity filter
        if (selectedActivities.length > 0) {
          filtered = filtered.filter(record => selectedActivities.includes(record.activity));
        }
        
        set({ filteredRecords: filtered });
      }
    }),
    {
      name: 'time-series-data-storage',
      partialize: (state) => ({
        // Only persist these values to localStorage
        selectedEmployees: state.selectedEmployees,
        selectedRegions: state.selectedRegions,
        selectedActivities: state.selectedActivities,
        dateRange: state.dateRange,
      }),
    }
  )
);