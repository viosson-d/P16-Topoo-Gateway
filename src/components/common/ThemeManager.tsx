
import { useEffect } from 'react';
import { useConfigStore } from '../../stores/useConfigStore';
import { getCurrentWindow } from '@tauri-apps/api/window';

<<<<<<< HEAD
import { isLinux } from '../../utils/env';
=======
// Detect if running on Linux platform
// const isLinux = navigator.userAgent.toLowerCase().includes('linux');
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

export default function ThemeManager() {
    const { config, loadConfig } = useConfigStore();

    // Load config on mount
    useEffect(() => {
        const init = async () => {
            await loadConfig();
            // Show window after a short delay to ensure React has painted
            setTimeout(async () => {
<<<<<<< HEAD
                if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
                    await getCurrentWindow().show();
                }
=======
                await getCurrentWindow().show();
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
            }, 100);
        };
        init();
    }, [loadConfig]);

    // Apply theme when config changes
    useEffect(() => {
        if (!config) return;

        const applyTheme = async (theme: string) => {
            const root = document.documentElement;
            const isDark = theme === 'dark';

<<<<<<< HEAD
            // Set Tauri window background color
            // Skip on Linux due to crash with transparent windows + softbuffer
            try {
                if (!isLinux() && (window as any).__TAURI_INTERNALS__) {
                    const bgColor = isDark ? '#1d232a' : '#FAFBFC';
                    // Don't await this, let it happen in background to avoid blocking React render
                    getCurrentWindow().setBackgroundColor(bgColor).catch(e =>
                        console.error('Failed to set window background color:', e)
                    );

                    // Sync Windows title bar theme (for minimize/maximize/close button colors)
                    const { invoke } = await import('@tauri-apps/api/core');
                    invoke('set_window_theme', { theme }).catch(() => {
                        // Ignore errors on non-Windows platforms
                    });
                }
            } catch (e) {
                console.error('Window background sync failed:', e);
            }
=======
            /* 
            try {
                if (!isLinux) {
                    const bgColor = isDark ? '#1d232a' : '#FAFBFC';
                    await getCurrentWindow().setBackgroundColor(bgColor);
                }
            } catch (e) {
                console.error('Failed to set window background color:', e);
            }
            */
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

            // Set DaisyUI theme
            root.setAttribute('data-theme', theme);

            // Set inline style for immediate visual feedback
            root.style.backgroundColor = isDark ? '#1d232a' : '#FAFBFC';

            // Set Tailwind dark mode class
            if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        const theme = config.theme || 'system';

        // Sync to localStorage for early boot check
        localStorage.setItem('app-theme-preference', theme);

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handleSystemChange = (e: MediaQueryListEvent | MediaQueryList) => {
                const systemTheme = e.matches ? 'dark' : 'light';
                applyTheme(systemTheme);
            };

            // Initial alignment
            handleSystemChange(mediaQuery);

            // Listen for changes
            mediaQuery.addEventListener('change', handleSystemChange);
            return () => mediaQuery.removeEventListener('change', handleSystemChange);
        } else {
            applyTheme(theme);
        }
    }, [config?.theme]);

    return null; // This component handles side effects only
}
