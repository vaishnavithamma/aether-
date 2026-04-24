import { create } from 'zustand';
import type { UploadResponse, DetectResponse } from '../types/api.types';

interface DetectionState {
  uploadData: UploadResponse | null;
  setUploadData: (data: UploadResponse) => void;
  detectData: DetectResponse | null;
  setDetectData: (data: DetectResponse) => void;
  fileName: string;
  setFileName: (name: string) => void;
}

export const useDetectionStore = create<DetectionState>((set) => ({
  uploadData: null,
  setUploadData: (data) => set({ uploadData: data }),
  detectData: null,
  setDetectData: (data) => set({ detectData: data }),
  fileName: '',
  setFileName: (name) => set({ fileName: name })
}));
