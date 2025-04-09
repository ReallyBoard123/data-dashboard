// store/useUIStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';
type VisualizationType = 'timeline' | 'heatmap' | 'sankey' | 'radar' | 'table';

interface UIState {
  // Theme
  theme: ThemeMode;
  
  // UI Settings
  sidebarCollapsed: boolean;
  currentView: VisualizationType;
  timelinePeriod: 'hourly' | 'daily' | 'weekly';
  
  // Actions
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setCurrentView: (view: VisualizationType) => void;
  setTimelinePeriod: (period: 'hourly' | 'daily' | 'weekly') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      sidebarCollapsed: false,
      currentView: 'timeline',
      timelinePeriod: 'hourly',
      
      // Actions
      setTheme: (theme) => {
        set({ theme });
      },
      
      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      
      setCurrentView: (view) => {
        set({ currentView: view });
      },
      
      setTimelinePeriod: (period) => {
        set({ timelinePeriod: period });
      },
    }),
    {
      name: 'time-series-ui-storage',
    }
  )
);