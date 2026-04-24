import { create } from 'zustand';

interface UiState {
  currentScreen: 'upload' | 'pipeline' | 'dashboard';
  setScreen: (screen: 'upload' | 'pipeline' | 'dashboard') => void;
  selectedRegionId: number | null;
  setSelectedRegion: (id: number | null) => void;
  splitPosition: number;
  setSplitPosition: (pos: number) => void;
  overlayOpacity: number;
  setOverlayOpacity: (opacity: number) => void;
  viewMode: 'rgb' | 'overlay' | 'heatmap' | 'mask';
  setViewMode: (mode: 'rgb' | 'overlay' | 'heatmap' | 'mask') => void;
}

export const useUiStore = create<UiState>((set) => ({
  currentScreen: 'upload',
  setScreen: (screen) => set({ currentScreen: screen }),
  selectedRegionId: null,
  setSelectedRegion: (id) => set({ selectedRegionId: id }),
  splitPosition: 50,
  setSplitPosition: (pos) => set({ splitPosition: pos }),
  overlayOpacity: 70,
  setOverlayOpacity: (opacity) => set({ overlayOpacity: opacity }),
  viewMode: 'overlay',
  setViewMode: (mode) => set({ viewMode: mode })
}));
