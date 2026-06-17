import { create } from "zustand";

export interface DownloadTarget {
  resourceSlug: string;
  resourceTitle?: string;
  fileId?: string;
  requireEmail?: boolean;
}

interface DownloadModalState {
  isOpen: boolean;
  target: DownloadTarget | null;
  open: (target: DownloadTarget) => void;
  close: () => void;
}

export const useDownloadModalStore = create<DownloadModalState>((set) => ({
  isOpen: false,
  target: null,
  open: (target) => set({ isOpen: true, target }),
  close: () => set({ isOpen: false, target: null }),
}));
