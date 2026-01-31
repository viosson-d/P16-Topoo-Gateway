import { create } from 'zustand';
import { request as invoke } from '../utils/request';


// New Data Structures for Gateway Communication
export type Role = 'engineer' | 'agent';

export interface MessageNode {
    id: string;
    role: Role;
    name: string;
    avatar?: string; // Optional custom avatar URL
    status: 'pending' | 'success' | 'error';
    timestamp: number;
    channel: string; // e.g., 'wechat', 'slack', 'cli'
    content?: string; // Content of the message
}

export interface CommunicationTurn {
    id: string;
    nodes: MessageNode[]; // Ordered flow: Engineer -> Agent
}

export interface DailyUsage {
    date: string;
    claude: number;
    gemini: number;
    sessions: number;
}

interface ActivityState {
    turns: CommunicationTurn[]; // Replaces generic 'events'
    usageHistory: DailyUsage[];
    loading: boolean;
    error: string | null;
    fetchUsageHistory: () => Promise<void>;
    fetchRecentActivity: () => Promise<void>;
    setupListeners: () => Promise<() => void>;
}

const mapLogToTurn = (log: any): CommunicationTurn | null => {
    // Validate required fields roughly to filter out debug events or malformed data
    if (!log || typeof log !== 'object') return null;

    // If it's the simple debug event, skip it or handle differently
    // The main flow expects a 'timestamp' number
    if (typeof log.timestamp !== 'number') {
        // Fallback for debug events or malformed timestamps
        console.warn('[Store] Invalid or missing timestamp in log, skipping or using fallback:', log);
        // Ensure we don't crash UI with bad dates.
        // If we strictly want to ignore events without valid timestamps (like TEST-SIMPLE):
        if (!log.timestamp) return null;
    }

    const safeTimestamp = (typeof log.timestamp === 'number' && !isNaN(log.timestamp))
        ? log.timestamp
        : Date.now();

    return {
        id: log.id || `unknown-${Date.now()}`,
        nodes: [
            {
                id: `${log.id}-req`,
                role: 'engineer',
                name: 'Engineer',
                status: 'success',
                timestamp: safeTimestamp,
                channel: log.protocol || 'openai',
                content: log.url || 'Unknown Request'
            },
            {
                id: `${log.id}-res`,
                role: 'agent',
                name: log.mapped_model || log.model || 'Agent',
                status: (log.status || 200) < 400 ? 'success' : 'error',
                timestamp: safeTimestamp + (log.duration || 0),
                channel: log.protocol || 'openai',
                content: log.error || `Status: ${log.status || 0}, Duration: ${log.duration || 0}ms`
            }
        ]
    };
};

export const useActivityStore = create<ActivityState>()(
    (set, get) => ({
        turns: [],
        usageHistory: [],
        loading: false,
        error: null,

        fetchUsageHistory: async () => {
            set({ loading: true, error: null });
            try {
                // Fetch last 14 days of model trend data
                const trendData: any[] = await invoke('get_token_stats_model_trend_daily', { days: 14 });

                const history: DailyUsage[] = trendData.map(point => {
                    // Aggregate all accounts for Claude and Gemini
                    let claudeTotal = 0;
                    let geminiTotal = 0;

                    if (point.model_data) {
                        Object.entries(point.model_data).forEach(([name, tokens]: [string, any]) => {
                            const lowerName = name.toLowerCase();
                            if (lowerName.includes('claude') || lowerName.includes('anthropic')) {
                                claudeTotal += tokens;
                            } else if (lowerName.includes('gemini') || lowerName.includes('google')) {
                                geminiTotal += tokens;
                            }
                        });
                    }

                    return {
                        date: point.period,
                        claude: claudeTotal,
                        gemini: geminiTotal,
                        sessions: 0
                    };
                });

                set({ usageHistory: history, loading: false });
            } catch (err) {
                console.error('[Store] Fetch usage history failed:', err);
                set({ error: String(err), loading: false });
            }
        },

        fetchRecentActivity: async () => {
            set({ loading: true, error: null });
            try {
                // Fetch latest 20 logs
                const logs: any[] = await invoke('get_proxy_logs_paginated', {
                    page: 0,
                    pageSize: 20
                });

                // Map ProxyRequestLog to CommunicationTurn
                const turns: CommunicationTurn[] = logs
                    .map(mapLogToTurn)
                    .filter((t): t is CommunicationTurn => t !== null);

                set({ turns, loading: false });
            } catch (err) {
                console.error('[Store] Fetch recent activity failed:', err);
                set({ error: String(err), loading: false });
            }
        },

        setupListeners: async () => {
            try {
                // Dynamic import to avoid initialization issues
                const { listen } = await import('@tauri-apps/api/event');
                console.log('[Store] Event API loaded dynamically');

                const handler = (event: any) => {
                    console.log('[Store] Received realtime log (raw):', event);
                    try {
                        const payload = event.payload;
                        if (!payload) {
                            console.warn('[Store] Received empty payload');
                            return;
                        }

                        // console.log('[Store] Processing payload:', payload); 
                        // Reduce console spam
                        const newTurn = mapLogToTurn(payload);

                        // If mapLogToTurn returned null (e.g. invalid debug event), ignore it
                        if (!newTurn) return;

                        set((state) => {
                            // Check for duplicates
                            if (state.turns.some(t => t.id === newTurn.id)) {
                                return state;
                            }
                            // Prepend new turn and limit to 50
                            const updatedTurns = [newTurn, ...state.turns].slice(0, 50);
                            return { turns: updatedTurns };
                        });

                        // Also refresh usage history to update the chart
                        get().fetchUsageHistory().catch((err: unknown) =>
                            console.error('[Store] Auto-refresh usage history failed:', err)
                        );
                    } catch (innerErr) {
                        console.error('[Store] Error processing event payload:', innerErr);
                    }
                };

                // Listen to both standard and simplified event names
                const unlistenStandard = await listen<any>('proxy://request', handler);
                const unlistenSimple = await listen<any>('proxy-request', handler);

                console.log('[Store] Event listeners attached successfully (Standard & Simple)');

                return () => {
                    unlistenStandard();
                    unlistenSimple();
                };
            } catch (err) {
                console.error('[Store] Failed to setup event listener:', err);
                return () => { };
            }
        }
    })
);
