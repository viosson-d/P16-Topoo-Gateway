import { create } from 'zustand';
import { AppConfig } from '../types/config';
import * as configService from '../services/configService';

interface ConfigState {
    config: AppConfig | null;
    loading: boolean;
    error: string | null;

    // Actions
    loadConfig: () => Promise<void>;
    saveConfig: (config: AppConfig) => Promise<void>;
    updateTheme: (theme: string) => Promise<void>;
    updateLanguage: (language: string) => Promise<void>;
    setConfig: (config: AppConfig) => void;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
    config: null,
    loading: false,
    error: null,

    loadConfig: async () => {
        set({ loading: true, error: null });
        try {
            const config = await configService.loadConfig();
            set({ config, loading: false });
        } catch (error) {
            console.error('Failed to load config:', error);
            // Don't clear config if we have one, just show error
            set({ error: String(error), loading: false });
        }
    },

    saveConfig: async (config: AppConfig) => {
        // Optimistic update: set state immediately
        set({ config, loading: true, error: null });

        try {
            await configService.saveConfig(config);
            set({ loading: false });
        } catch (error) {
            console.error('Failed to save config:', error);
            // In case of error, we might want to revert, but for now let's keep the session state mismatch
            // to allow the user to at least "use" the app visually.
            // A toast should be handled by the caller or global error handler.
            set({ error: String(error), loading: false });
            throw error;
        }
    },

    updateTheme: async (theme: string) => {
        const { config } = get();
        if (!config) return;

        const newConfig = { ...config, theme };
        // Directly call saveConfig which now handles optimistic update
        await get().saveConfig(newConfig);
    },

    updateLanguage: async (language: string) => {
        const { config } = get();
        if (!config) return;

        const newConfig = { ...config, language };
        await get().saveConfig(newConfig);
    },

    setConfig: (config: AppConfig) => {
        set({ config });
    },
}));
