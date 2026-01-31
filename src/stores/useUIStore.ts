import { create } from 'zustand';

interface UIState {
    isSettingsOpen: boolean;
    setSettingsOpen: (isOpen: boolean) => void;
    toggleSettings: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSettingsOpen: false,
    setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
}));
