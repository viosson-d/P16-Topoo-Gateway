<<<<<<< HEAD
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { request as invoke } from '../utils/request';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Clock, Calendar, CalendarDays, Users, Zap, TrendingUp, RefreshCw, Cpu } from 'lucide-react';

=======
import React, { useEffect, useState, useMemo } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { RefreshCw, Zap, Layers, TrendingUp, Users, Cpu, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
import { cn } from '../lib/utils';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';

// --- Types ---
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
interface TokenStatsAggregated {
    period: string;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    request_count: number;
}

interface AccountTokenStats {
    account_email: string;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    request_count: number;
}

interface ModelTokenStats {
    model: string;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    request_count: number;
}

interface ModelTrendPoint {
    period: string;
    model_data: Record<string, number>;
}

interface AccountTrendPoint {
    period: string;
    account_data: Record<string, number>;
}

interface TokenStatsSummary {
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    total_requests: number;
    unique_accounts: number;
}

type TimeRange = 'hourly' | 'daily' | 'weekly';
type ViewMode = 'model' | 'account';

<<<<<<< HEAD
=======
// --- Constants & Helpers ---
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
const MODEL_COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#06b6d4', '#6366f1', '#f43f5e', '#84cc16', '#a855f7',
    '#14b8a6', '#f97316', '#64748b', '#0ea5e9', '#d946ef'
];

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#f43f5e'];

const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

const shortenModelName = (model: string): string => {
    return model
        .replace('gemini-', 'g-')
        .replace('claude-', 'c-')
        .replace('-preview', '')
        .replace('-latest', '');
};

<<<<<<< HEAD
=======
// --- Custom Tooltips ---
const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border rounded-lg p-3 shadow-md animate-in zoom-in-95 duration-200">
                <p className="text-xs font-semibold text-muted-foreground mb-2 pb-2 border-b border-border">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-xs font-medium text-foreground">{entry.name}</span>
                            </div>
                            <span className="text-xs font-bold tabular-nums text-foreground">{entry.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const SimpleCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover border border-border rounded-lg p-2 shadow-sm animate-in fade-in duration-200">
                <p className="text-[10px] font-medium text-muted-foreground mb-1">{label}</p>
                <p className="text-xs font-bold text-foreground">{payload[0].value.toLocaleString()} tokens</p>
            </div>
        );
    }
    return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-popover border border-border rounded-lg p-2.5 shadow-sm animate-in zoom-in-95 duration-200">
                <p className="text-xs font-medium text-foreground mb-1">{data.name}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                    <p className="text-sm font-bold tabular-nums text-foreground">{data.value.toLocaleString()}</p>
                </div>
            </div>
        );
    }
    return null;
};

// --- Main Component ---
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
const TokenStats: React.FC = () => {
    const { t } = useTranslation();
    const [timeRange, setTimeRange] = useState<TimeRange>('daily');
    const [viewMode, setViewMode] = useState<ViewMode>('model');
<<<<<<< HEAD
    const [chartData, setChartData] = useState<TokenStatsAggregated[]>([]);
    const [accountData, setAccountData] = useState<AccountTokenStats[]>([]);
    const [modelData, setModelData] = useState<ModelTokenStats[]>([]);
    const [modelTrendData, setModelTrendData] = useState<any[]>([]);
    const [accountTrendData, setAccountTrendData] = useState<any[]>([]);
    const [allModels, setAllModels] = useState<string[]>([]);
    const [allAccounts, setAllAccounts] = useState<string[]>([]);
    const [summary, setSummary] = useState<TokenStatsSummary | null>(null);
    const [loading, setLoading] = useState(true);
=======
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState<TokenStatsSummary | null>(null);
    const [chartData, setChartData] = useState<TokenStatsAggregated[]>([]);
    const [modelData, setModelData] = useState<ModelTokenStats[]>([]);
    const [accountData, setAccountData] = useState<AccountTokenStats[]>([]);
    const [modelTrendData, setModelTrendData] = useState<ModelTrendPoint[]>([]);
    const [accountTrendData, setAccountTrendData] = useState<AccountTrendPoint[]>([]);
    const [allModels, setAllModels] = useState<string[]>([]);
    const [allAccounts, setAllAccounts] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, [timeRange]);
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

    const fetchData = async () => {
        setLoading(true);
        try {
<<<<<<< HEAD
            let hours = 24;
            let data: TokenStatsAggregated[] = [];
            let modelTrend: ModelTrendPoint[] = [];
            let accountTrend: AccountTrendPoint[] = [];

            switch (timeRange) {
                case 'hourly':
                    hours = 24;
                    data = await invoke<TokenStatsAggregated[]>('get_token_stats_hourly', { hours: 24 });
                    modelTrend = await invoke<ModelTrendPoint[]>('get_token_stats_model_trend_hourly', { hours: 24 });
                    accountTrend = await invoke<AccountTrendPoint[]>('get_token_stats_account_trend_hourly', { hours: 24 });
                    break;
                case 'daily':
                    hours = 168;
                    data = await invoke<TokenStatsAggregated[]>('get_token_stats_daily', { days: 7 });
                    modelTrend = await invoke<ModelTrendPoint[]>('get_token_stats_model_trend_daily', { days: 7 });
                    accountTrend = await invoke<AccountTrendPoint[]>('get_token_stats_account_trend_daily', { days: 7 });
                    break;
                case 'weekly':
                    hours = 720;
                    data = await invoke<TokenStatsAggregated[]>('get_token_stats_weekly', { weeks: 4 });
                    modelTrend = await invoke<ModelTrendPoint[]>('get_token_stats_model_trend_daily', { days: 30 });
                    accountTrend = await invoke<AccountTrendPoint[]>('get_token_stats_account_trend_daily', { days: 30 });
                    break;
            }

            setChartData(data);

            const models = new Set<string>();
            modelTrend.forEach(point => {
                Object.keys(point.model_data).forEach(m => models.add(m));
            });
            const modelList = Array.from(models);
            setAllModels(modelList);

            const transformedTrend = modelTrend.map(point => {
                const row: Record<string, any> = { period: point.period };
                modelList.forEach(model => {
                    row[model] = point.model_data[model] || 0;
                });
                return row;
            });
            setModelTrendData(transformedTrend);

            // Process Account Trend Data
            const accountsSet = new Set<string>();
            accountTrend.forEach(point => {
                Object.keys(point.account_data).forEach(acc => accountsSet.add(acc));
            });
            const accountList = Array.from(accountsSet);
            setAllAccounts(accountList);

            const transformedAccountTrend = accountTrend.map(point => {
                const row: Record<string, any> = { period: point.period };
                accountList.forEach(acc => {
                    row[acc] = point.account_data[acc] || 0;
                });
                return row;
            });
            setAccountTrendData(transformedAccountTrend);

            const [accounts, models_stats, summaryData] = await Promise.all([
                invoke<AccountTokenStats[]>('get_token_stats_by_account', { hours }),
                invoke<ModelTokenStats[]>('get_token_stats_by_model', { hours }),
                invoke<TokenStatsSummary>('get_token_stats_summary', { hours })
            ]);

            setAccountData(accounts);
            setModelData(models_stats);
            setSummary(summaryData);
=======
            const [
                summaryData,
                aggregatedData,
                mStats,
                aStats,
                mTrend,
                aTrend
            ] = await Promise.all([
                invoke<TokenStatsSummary>('get_token_stats_summary'),
                invoke<TokenStatsAggregated[]>('get_aggregated_token_stats', { range: timeRange }),
                invoke<ModelTokenStats[]>('get_model_token_stats'),
                invoke<AccountTokenStats[]>('get_account_token_stats'),
                invoke<ModelTrendPoint[]>('get_model_usage_trend', { range: timeRange }),
                invoke<AccountTrendPoint[]>('get_account_usage_trend', { range: timeRange })
            ]);

            setSummary(summaryData);
            setChartData(aggregatedData);
            setModelData(mStats);
            setAccountData(aStats);
            setModelTrendData(mTrend);
            setAccountTrendData(aTrend);

            // Extract unique models/accounts for trend lines
            if (mTrend.length > 0) {
                const modelsSet = new Set<string>();
                mTrend.forEach(p => Object.keys(p.model_data).forEach(m => modelsSet.add(m)));
                setAllModels(Array.from(modelsSet));
            }

            if (aTrend.length > 0) {
                const accountsSet = new Set<string>();
                aTrend.forEach(p => Object.keys(p.account_data).forEach(a => accountsSet.add(a)));
                setAllAccounts(Array.from(accountsSet));
            }
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        } catch (error) {
            console.error('Failed to fetch token stats:', error);
        } finally {
            setLoading(false);
        }
    };

<<<<<<< HEAD
    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const pieData = accountData.slice(0, 8).map((account, index) => ({
        name: account.account_email.split('@')[0] + '...',
        value: account.total_tokens,
        fullEmail: account.account_email,
        color: COLORS[index % COLORS.length]
    }));

    const modelColorMap = new Map<string, string>();
    allModels.forEach((model, index) => {
        modelColorMap.set(model, MODEL_COLORS[index % MODEL_COLORS.length]);
    });

    const trendChartContainerRef = useRef<HTMLDivElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | undefined>(undefined);

    // Ref and state for pie chart tooltip position
    const pieChartContainerRef = useRef<HTMLDivElement>(null);
    const [pieTooltipPosition, setPieTooltipPosition] = useState<{ x: number; y: number } | undefined>(undefined);

    // Handle mouse move to calculate tooltip position
    const handleTrendChartMouseMove = useCallback((e: any) => {
        if (!trendChartContainerRef.current || !e?.activeCoordinate) return;

        const containerRect = trendChartContainerRef.current.getBoundingClientRect();
        const tooltipWidth = 200; // Approximate tooltip width
        const rightEdgeThreshold = containerRect.width - tooltipWidth - 20; // 20px buffer

        const mouseXInContainer = e.activeCoordinate.x;

        if (mouseXInContainer > rightEdgeThreshold) {
            setTooltipPosition({
                x: e.activeCoordinate.x - tooltipWidth - 15,
                y: e.activeCoordinate.y
            });
        } else {
            setTooltipPosition(undefined); // Use default positioning
        }
    }, []);

    // Handle mouse move for pie chart to calculate tooltip position
    const handlePieChartMouseMove = useCallback((e: any) => {
        if (!pieChartContainerRef.current) return;

        const containerRect = pieChartContainerRef.current.getBoundingClientRect();
        const tooltipWidth = 180; // Approximate tooltip width for pie chart

        // Get mouse position relative to container
        if (e?.activeCoordinate) {
            const mouseXInContainer = e.activeCoordinate.x;
            const rightEdgeThreshold = containerRect.width - tooltipWidth - 20;

            if (mouseXInContainer > rightEdgeThreshold) {
                setPieTooltipPosition({
                    x: e.activeCoordinate.x - tooltipWidth - 15,
                    y: e.activeCoordinate.y
                });
            } else {
                setPieTooltipPosition(undefined);
            }
        }
    }, []);

    // Custom Tooltip for Trend Chart
    const CustomTrendTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;

        // Sort payload by value descending
        const sortedPayload = [...payload].sort((a: any, b: any) => b.value - a.value);

        return (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-xs z-[100] min-w-[180px] pointer-events-none">
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1.5 border-b border-gray-100 dark:border-gray-700 pb-1.5">
                    {label}
                </p>
                <div className="max-h-[180px] overflow-y-auto space-y-1 pr-1.5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                    {sortedPayload.map((entry: any, index: number) => {
                        const name = entry.name;
                        const displayName = viewMode === 'model' ? shortenModelName(name) : name.split('@')[0];
                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                                    <span className="text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={name}>
                                        {displayName}
                                    </span>
                                </div>
                                <span className="font-mono font-medium text-gray-700 dark:text-gray-200">
                                    {formatNumber(entry.value)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Custom Tooltip for Bar/Pie Charts
    const SimpleCustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload || !payload.length) return null;
        return (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-xs z-[100] pointer-events-none">
                {label && <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>}
                <div className="space-y-1">
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                            <span className="text-gray-500 dark:text-gray-400">
                                {entry.name}:
                            </span>
                            <span className="font-mono font-medium text-gray-700 dark:text-gray-200">
                                {formatNumber(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Custom Tooltip for Pie Chart
    const CustomPieTooltip = ({ active, payload }: any) => {
        if (!active || !payload || !payload.length) return null;
        const entry = payload[0];
        return (
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-2.5 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 text-xs z-[100] pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload.color || entry.color }} />
                    <span className="text-gray-500 dark:text-gray-400">
                        {entry.payload.fullEmail || entry.name}:
                    </span>
                    <span className="font-mono font-medium text-gray-700 dark:text-gray-200">
                        {formatNumber(entry.value)}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full overflow-y-auto">
            <div className="p-5 space-y-4 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-blue-500" />
                        {t('token_stats.title', 'Token 消费统计')}
                    </h1>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setTimeRange('hourly')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${timeRange === 'hourly'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                    }`}
                            >
                                <Clock className="w-4 h-4" />
                                {t('token_stats.hourly', '小时')}
                            </button>
                            <button
                                onClick={() => setTimeRange('daily')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${timeRange === 'daily'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                    }`}
                            >
                                <Calendar className="w-4 h-4" />
                                {t('token_stats.daily', '日')}
                            </button>
                            <button
                                onClick={() => setTimeRange('weekly')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${timeRange === 'weekly'
                                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
                                    }`}
                            >
                                <CalendarDays className="w-4 h-4" />
                                {t('token_stats.weekly', '周')}
                            </button>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={loading}
                            className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                                <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <Zap className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </div>
                                {t('token_stats.total_tokens', '总 Token')}
                            </div>
                            <div className="text-2xl font-bold text-gray-800 dark:text-white">
                                {formatNumber(summary.total_tokens)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-blue-900/30 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-blue-600/80 dark:text-blue-400/80 text-sm mb-2">
                                <div className="p-1.5 rounded-lg bg-blue-100/50 dark:bg-blue-900/30">
                                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                {t('token_stats.input_tokens', '输入 Token')}
                            </div>
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {formatNumber(summary.total_input_tokens)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-purple-100 dark:border-purple-900/30 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-purple-600/80 dark:text-purple-400/80 text-sm mb-2">
                                <div className="p-1.5 rounded-lg bg-purple-100/50 dark:bg-purple-900/30">
                                    <TrendingUp className="w-4 h-4 rotate-180 text-purple-600 dark:text-purple-400" />
                                </div>
                                {t('token_stats.output_tokens', '输出 Token')}
                            </div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {formatNumber(summary.total_output_tokens)}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50/50 to-white dark:from-green-900/10 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-green-100 dark:border-green-900/30 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-green-600/80 dark:text-green-400/80 text-sm mb-2">
                                <div className="p-1.5 rounded-lg bg-green-100/50 dark:bg-green-900/30">
                                    <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                {t('token_stats.accounts_used', '活跃账号')}
                            </div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {summary.unique_accounts}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-900/10 dark:to-gray-800 rounded-xl p-4 shadow-sm border border-orange-100 dark:border-orange-900/30 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 text-orange-600/80 dark:text-orange-400/80 text-sm mb-2">
                                <div className="p-1.5 rounded-lg bg-orange-100/50 dark:bg-orange-900/30">
                                    <Cpu className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                {t('token_stats.models_used', '使用模型')}
                            </div>
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {modelData.length}
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            {viewMode === 'model' ? (
                                <Cpu className="w-5 h-5 text-purple-500" />
                            ) : (
                                <Users className="w-5 h-5 text-green-500" />
                            )}
                            {viewMode === 'model'
                                ? t('token_stats.model_trend', '分模型使用趋势')
                                : t('token_stats.account_trend', '分账号使用趋势')
                            }
                        </h2>
                        <div className="flex bg-gray-100/80 dark:bg-gray-700/50 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('model')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'model'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {t('token_stats.by_model', '按模型')}
                            </button>
                            <button
                                onClick={() => setViewMode('account')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === 'account'
                                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {t('token_stats.by_account_view', '按账号')}
                            </button>
                        </div>
                    </div>
                    <div className="h-72" ref={trendChartContainerRef}>
                        {modelTrendData.length > 0 && allModels.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={viewMode === 'model' ? modelTrendData : accountTrendData}
                                    onMouseMove={handleTrendChartMouseMove}
                                    onMouseLeave={() => setTooltipPosition(undefined)}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.15} />
                                    <XAxis
                                        dataKey="period"
                                        tick={{ fontSize: 11, fill: '#6b7280' }}
                                        tickFormatter={(val) => {
                                            if (timeRange === 'hourly') return val.split(' ')[1] || val;
                                            if (timeRange === 'daily') return val.split('-').slice(1).join('/');
                                            return val;
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#6b7280' }}
                                        tickFormatter={(val) => formatNumber(val)}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        content={<CustomTrendTooltip />}
                                        cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4', fill: 'transparent' }}
                                        allowEscapeViewBox={{ x: true, y: true }}
                                        position={tooltipPosition}
                                        wrapperStyle={{ zIndex: 100 }}
                                    />
                                    <Legend
                                        formatter={(value) => viewMode === 'model' ? shortenModelName(value) : value.split('@')[0]}
                                        wrapperStyle={{
                                            fontSize: '11px',
                                            paddingTop: '10px',
                                            maxHeight: '60px',
                                            overflowY: 'auto',
                                            zIndex: 0
                                        }}
                                    />
                                    {(viewMode === 'model' ? allModels : allAccounts).map((item, index) => (
                                        <Area
                                            key={item}
                                            type="monotone"
                                            dataKey={item}
                                            stackId="1"
                                            stroke={viewMode === 'model' ? MODEL_COLORS[index % MODEL_COLORS.length] : COLORS[index % COLORS.length]}
                                            fill={viewMode === 'model' ? MODEL_COLORS[index % MODEL_COLORS.length] : COLORS[index % COLORS.length]}
                                            fillOpacity={0.6}
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                {loading ? t('common.loading', '加载中...') : t('token_stats.no_data', '暂无数据')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            {t('token_stats.usage_trend', 'Token 使用趋势')}
                        </h2>
                        <div className="flex-1 min-h-[16rem]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.15} />
                                        <XAxis
                                            dataKey="period"
                                            tick={{ fontSize: 11, fill: '#6b7280' }}
                                            tickFormatter={(val) => {
                                                if (timeRange === 'hourly') return val.split(' ')[1] || val;
                                                if (timeRange === 'daily') return val.split('-').slice(1).join('/');
                                                return val;
                                            }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#6b7280' }}
                                            tickFormatter={(val) => formatNumber(val)}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            content={<SimpleCustomTooltip />}
                                            cursor={{ fill: 'transparent' }}
                                            allowEscapeViewBox={{ x: true, y: true }}
                                            wrapperStyle={{ zIndex: 100 }}
                                        />
                                        <Bar dataKey="total_input_tokens" name="Input" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        <Bar dataKey="total_output_tokens" name="Output" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    {loading ? t('common.loading', '加载中...') : t('token_stats.no_data', '暂无数据')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            {t('token_stats.by_account', '分账号统计')}
                        </h2>
                        <div className="h-48" ref={pieChartContainerRef}>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart
                                        onMouseMove={handlePieChartMouseMove}
                                        onMouseLeave={() => setPieTooltipPosition(undefined)}
                                    >
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={<CustomPieTooltip />}
                                            allowEscapeViewBox={{ x: true, y: true }}
                                            position={pieTooltipPosition}
                                            wrapperStyle={{ zIndex: 100 }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    {loading ? t('common.loading', '加载中...') : t('token_stats.no_data', '暂无数据')}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto">
                            {accountData.slice(0, 5).map((account, index) => (
                                <div key={account.account_email} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                                            {account.account_email.split('@')[0]}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 dark:text-white">
                                        {formatNumber(account.total_tokens)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>


                {
                    modelData.length > 0 && viewMode === 'model' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Cpu className="w-5 h-5 text-blue-500" />
                                {t('token_stats.model_details', '分模型详细统计')}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.model', '模型')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.requests', '请求数')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.input', '输入')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.output', '输出')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.total', '合计')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.percentage', '占比')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {modelData.map((model, index) => {
                                            const percentage = summary ? ((model.total_tokens / summary.total_tokens) * 100).toFixed(1) : '0';
                                            return (
                                                <tr
                                                    key={model.model}
                                                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: MODEL_COLORS[index % MODEL_COLORS.length] }}
                                                            />
                                                            <span className="text-gray-800 dark:text-white font-medium">
                                                                {model.model}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">
                                                        {model.request_count.toLocaleString()}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-blue-600">
                                                        {formatNumber(model.total_input_tokens)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-purple-600">
                                                        {formatNumber(model.total_output_tokens)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-semibold text-gray-800 dark:text-white">
                                                        {formatNumber(model.total_tokens)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                <div
                                                                    className="h-2 rounded-full"
=======
    const pieData = useMemo(() => {
        if (viewMode === 'account') {
            return accountData.map((acc, index) => ({
                name: acc.account_email,
                value: acc.total_tokens,
                color: COLORS[index % COLORS.length]
            }));
        } else {
            // Calculate provider distribution based on model prefixes
            const providerMap: Record<string, number> = {
                'Gemini': 0,
                'Claude': 0,
                'Other': 0
            };

            modelData.forEach(m => {
                const name = m.model.toLowerCase();
                if (name.includes('gemini')) providerMap['Gemini'] += m.total_tokens;
                else if (name.includes('claude')) providerMap['Claude'] += m.total_tokens;
                else providerMap['Other'] += m.total_tokens;
            });

            return Object.entries(providerMap)
                .filter(([_, value]) => value > 0)
                .map(([name, value], index) => ({
                    name,
                    value,
                    color: index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#ec4899'
                }));
        }
    }, [viewMode, accountData, modelData]);



    return (
        <PageContainer className="bg-background/50 p-0 overflow-hidden flex flex-col h-full">
            {/* Sticky Header Container */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-8 pt-8 pb-2 space-y-4 shrink-0">
                <PageHeader
                    title={t('token_stats.title', 'Token Statistics')}
                    description={t('token_stats.subtitle', 'Detailed insights into your API token usage and costs.')}
                    className="mb-0"
                    sticky={false}
                />

                {/* Time Range Tabs & Refresh */}
                <div className="flex items-center gap-3">
                    <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)} className="w-[300px]">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="hourly">
                                {t('token_stats.hourly', 'Hourly')}
                            </TabsTrigger>
                            <TabsTrigger value="daily">
                                {t('token_stats.daily', 'Daily')}
                            </TabsTrigger>
                            <TabsTrigger value="weekly">
                                {t('token_stats.weekly', 'Weekly')}
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="h-7 w-7 flex items-center justify-center p-0 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-all active:scale-95 border border-transparent hover:border-border/40"
                    >
                        <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground/35", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4 space-y-4">
                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <Card className="p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                <div className="p-1.5 rounded-md bg-muted">
                                    <Zap className="w-3.5 h-3.5 text-foreground" strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-medium">{t('token_stats.total_tokens', 'Total Tokens')}</span>
                            </div>
                            <div className="text-[20px] font-semibold tracking-tight">{formatNumber(summary.total_tokens)}</div>
                        </Card>

                        <Card className="p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200 border-blue-200/40 dark:border-blue-900/40 bg-blue-50/30 dark:bg-blue-900/10">
                            <div className="flex items-center gap-2 text-blue-600/90 dark:text-blue-400 mb-2">
                                <div className="p-1.5 rounded-md bg-blue-100/50 dark:bg-blue-900/30">
                                    <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-medium">{t('token_stats.total_requests', 'Total Requests')}</span>
                            </div>
                            <div className="text-[20px] font-semibold text-blue-700 dark:text-blue-400">{summary.total_requests.toLocaleString()}</div>
                        </Card>

                        <Card className="p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-2 text-purple-600/90 dark:text-purple-400 mb-2">
                                <div className="p-1.5 rounded-md bg-purple-100/50 dark:bg-purple-900/30">
                                    <TrendingUp className="w-3.5 h-3.5 rotate-180" strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-medium">{t('token_stats.input_tokens', 'Input Tokens')}</span>
                            </div>
                            <div className="text-[20px] font-semibold text-purple-700 dark:text-purple-400">{formatNumber(summary.total_input_tokens)}</div>
                        </Card>

                        <Card className="p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-2 text-green-600/90 dark:text-green-400 mb-2">
                                <div className="p-1.5 rounded-md bg-green-100/50 dark:bg-green-900/30">
                                    <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-medium">{t('token_stats.accounts_used', 'Active Accounts')}</span>
                            </div>
                            <div className="text-[20px] font-semibold text-green-700 dark:text-green-400">{summary.unique_accounts}</div>
                        </Card>

                        <Card className="p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex items-center gap-2 text-orange-600/90 dark:text-orange-400 mb-2">
                                <div className="p-1.5 rounded-md bg-orange-100/50 dark:bg-orange-900/30">
                                    <Cpu className="w-3.5 h-3.5" strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-medium">{t('token_stats.models_used', 'Models Used')}</span>
                            </div>
                            <div className="text-[20px] font-semibold text-orange-700 dark:text-orange-400">{modelData.length}</div>
                        </Card>
                    </div>
                )}

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Trend Chart */}
                    <Card className="col-span-1 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <div className="flex flex-col gap-0.5">
                                <CardTitle className="text-[13px] font-medium text-foreground/90 tracking-tight leading-snug">
                                    {viewMode === 'model'
                                        ? t('token_stats.model_trend', 'Model Usage Trend')
                                        : t('token_stats.account_trend', 'Account Usage Trend')
                                    }
                                </CardTitle>
                                <CardDescription className="text-[11px] text-muted-foreground/60 leading-snug">
                                    {t('token_stats.trend_subtitle', 'Historical usage data over the selected period')}
                                </CardDescription>
                            </div>

                            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                                <TabsList className="h-8">
                                    <TabsTrigger value="model" className="text-xs px-3 h-7">
                                        {t('token_stats.by_model', 'By Model')}
                                    </TabsTrigger>
                                    <TabsTrigger value="account" className="text-xs px-3 h-7">
                                        {t('token_stats.by_account_view', 'By Account')}
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full mt-2">
                                {modelTrendData.length > 0 && (viewMode === 'model' ? allModels.length > 0 : allAccounts.length > 0) ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={viewMode === 'model' ? modelTrendData : accountTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                                            <XAxis
                                                dataKey="period"
                                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                                tickFormatter={(val) => {
                                                    if (timeRange === 'hourly') return val.split(' ')[1] || val;
                                                    if (timeRange === 'daily') return val.split('-').slice(1).join('/');
                                                    return val;
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                                tickFormatter={(val) => formatNumber(val)}
                                                axisLine={false}
                                                tickLine={false}
                                                width={40}
                                            />
                                            <Tooltip
                                                content={<CustomTrendTooltip />}
                                                cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            />
                                            <Legend
                                                formatter={(value) => <span className="text-[10px] font-medium text-foreground ml-1">{viewMode === 'model' ? shortenModelName(value) : value.split('@')[0]}</span>}
                                                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                                                iconType="circle"
                                                iconSize={8}
                                            />
                                            {(viewMode === 'model' ? allModels : allAccounts).map((item, index) => (
                                                <Area
                                                    key={item}
                                                    type="monotone"
                                                    dataKey={item}
                                                    stackId="1"
                                                    stroke={viewMode === 'model' ? MODEL_COLORS[index % MODEL_COLORS.length] : COLORS[index % COLORS.length]}
                                                    fill={viewMode === 'model' ? MODEL_COLORS[index % MODEL_COLORS.length] : COLORS[index % COLORS.length]}
                                                    fillOpacity={0.5}
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <Layers className="w-6 h-6 opacity-20" strokeWidth={1.5} />
                                        <span className="text-[12px] font-normal opacity-50">{loading ? t('common.loading', 'Loading...') : t('token_stats.no_data', 'No data available')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Usage Bar Chart */}
                    <Card className="lg:col-span-2 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex flex-col gap-0.5">
                                <CardTitle className="text-[13px] font-medium text-foreground/90 tracking-tight leading-snug">
                                    {t('token_stats.usage_trend', 'Token Usage Trend')}
                                </CardTitle>
                                <CardDescription className="text-[11px] text-muted-foreground/60 leading-snug">
                                    {t('token_stats.input_vs_output', 'Breakdown of input vs output tokens')}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full mt-2">
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                                            <XAxis
                                                dataKey="period"
                                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                                tickFormatter={(val) => {
                                                    if (timeRange === 'hourly') return val.split(' ')[1] || val;
                                                    if (timeRange === 'daily') return val.split('-').slice(1).join('/');
                                                    return val;
                                                }}
                                                axisLine={false}
                                                tickLine={false}
                                                dy={10}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                                tickFormatter={(val) => formatNumber(val)}
                                                axisLine={false}
                                                tickLine={false}
                                                width={40}
                                            />
                                            <Tooltip
                                                content={<SimpleCustomTooltip />}
                                                cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                                                allowEscapeViewBox={{ x: true, y: true }}
                                            />
                                            <Legend
                                                iconType="circle"
                                                iconSize={8}
                                                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                                                formatter={(value) => <span className="text-[10px] font-medium text-foreground ml-1">{value}</span>}
                                            />
                                            <Bar dataKey="total_input_tokens" name="Input" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            <Bar dataKey="total_output_tokens" name="Output" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <Layers className="w-6 h-6 opacity-20" strokeWidth={1.5} />
                                        <span className="text-[12px] font-normal opacity-50">{loading ? t('common.loading', 'Loading...') : t('token_stats.no_data', 'No data available')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Distribution Pie Chart */}
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex flex-col gap-0.5">
                                <CardTitle className="text-[13px] font-medium text-foreground/90 tracking-tight leading-snug">
                                    {viewMode === 'account' ? t('token_stats.by_account', 'Account Distribution') : t('token_stats.provider_dist', 'Provider Distribution')}
                                </CardTitle>
                                <CardDescription className="text-[11px] text-muted-foreground/60 leading-snug">
                                    {viewMode === 'account' ? t('token_stats.top_accounts', 'Top accounts by usage') : t('token_stats.top_providers', 'Usage by AI provider')}
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] flex flex-col justify-between">
                                {pieData.length > 0 ? (
                                    <>
                                        <div className="h-[180px] w-full mb-4">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={75}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                        stroke="hsl(var(--background))"
                                                        strokeWidth={2}
                                                    >
                                                        {pieData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip content={<CustomPieTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-3 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                                            {pieData.slice(0, 10).map((item) => (
                                                <div key={item.name} className="flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-2.5 h-2.5 rounded-full shrink-0"
                                                            style={{ backgroundColor: item.color }}
                                                        />
                                                        <span className="text-muted-foreground truncate max-w-[100px] font-medium">
                                                            {viewMode === 'account' ? item.name.split('@')[0] : item.name}
                                                        </span>
                                                    </div>
                                                    <span className="font-semibold tabular-nums text-foreground">
                                                        {formatNumber(item.value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                        <PieChartIcon className="w-6 h-6 opacity-20" strokeWidth={1.5} />
                                        <span className="text-[12px] font-normal opacity-50">{loading ? t('common.loading', 'Loading...') : t('token_stats.no_data', 'No data available')}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Table Section */}
                {viewMode === 'model' && modelData.length > 0 && (
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-[13px] font-medium text-foreground/90 tracking-tight leading-snug flex items-center gap-2">
                                <Cpu className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                                {t('token_stats.model_details', 'Model Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="rounded-b-lg border-t">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-muted/30">
                                            <TableHead className="w-[30%] text-xs">{t('token_stats.model', 'Model')}</TableHead>
                                            <TableHead className="text-right text-xs text-muted-foreground">{t('token_stats.requests', 'Requests')}</TableHead>
                                            <TableHead className="text-right text-xs text-blue-600 dark:text-blue-400">{t('token_stats.input', 'Input')}</TableHead>
                                            <TableHead className="text-right text-xs text-purple-600 dark:text-purple-400">{t('token_stats.output', 'Output')}</TableHead>
                                            <TableHead className="text-right text-xs">{t('token_stats.total', 'Total')}</TableHead>
                                            <TableHead className="text-right text-xs w-[120px]">{t('token_stats.percentage', 'Share')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modelData.map((model, index) => {
                                            const percentage = summary ? ((model.total_tokens / summary.total_tokens) * 100).toFixed(1) : '0';
                                            return (
                                                <TableRow key={model.model} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className="w-2 h-2 rounded-full shrink-0"
                                                                style={{ backgroundColor: MODEL_COLORS[index % MODEL_COLORS.length] }}
                                                            />
                                                            <span className="text-xs font-semibold truncate max-w-[200px]" title={model.model}>{model.model}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs text-muted-foreground tabular-nums">{model.request_count.toLocaleString()}</TableCell>
                                                    <TableCell className="text-right text-xs text-blue-600/90 dark:text-blue-400/90 tabular-nums">{formatNumber(model.total_input_tokens)}</TableCell>
                                                    <TableCell className="text-right text-xs text-purple-600/90 dark:text-purple-400/90 tabular-nums">{formatNumber(model.total_output_tokens)}</TableCell>
                                                    <TableCell className="text-right text-xs font-bold tabular-nums">{formatNumber(model.total_tokens)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-16 bg-muted/50 rounded-full h-1.5 overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full"
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
                                                                    style={{
                                                                        width: `${percentage}%`,
                                                                        backgroundColor: MODEL_COLORS[index % MODEL_COLORS.length]
                                                                    }}
                                                                />
                                                            </div>
<<<<<<< HEAD
                                                            <span className="text-gray-600 dark:text-gray-300 w-12 text-right">
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }



                {
                    accountData.length > 0 && viewMode === 'account' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                {t('token_stats.account_details', '账号详细统计')}
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.account', '账号')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.requests', '请求数')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.input', '输入')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.output', '输出')}
                                            </th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                                                {t('token_stats.total', '合计')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {accountData.map((account) => (
                                            <tr
                                                key={account.account_email}
                                                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                                            >
                                                <td className="py-3 px-4 text-gray-800 dark:text-white">
                                                    {account.account_email}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">
                                                    {account.request_count.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-right text-blue-600">
                                                    {formatNumber(account.total_input_tokens)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-purple-600">
                                                    {formatNumber(account.total_output_tokens)}
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-gray-800 dark:text-white">
                                                    {formatNumber(account.total_tokens)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
=======
                                                            <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {viewMode === 'account' && accountData.length > 0 && (
                    <Card className="shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-[13px] font-medium text-foreground/90 tracking-tight leading-snug flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-green-600 dark:text-green-500" strokeWidth={1.5} />
                                {t('token_stats.account_details', 'Account Details')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="rounded-b-lg border-t">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-muted/30">
                                            <TableHead className="w-[40%] text-xs">{t('token_stats.account', 'Account')}</TableHead>
                                            <TableHead className="text-right text-xs text-muted-foreground">{t('token_stats.requests', 'Requests')}</TableHead>
                                            <TableHead className="text-right text-xs text-blue-600 dark:text-blue-400">{t('token_stats.input', 'Input')}</TableHead>
                                            <TableHead className="text-right text-xs text-purple-600 dark:text-purple-400">{t('token_stats.output', 'Output')}</TableHead>
                                            <TableHead className="text-right text-xs">{t('token_stats.total', 'Total')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accountData.map((account) => (
                                            <TableRow key={account.account_email} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="font-medium text-xs">
                                                    <span className="text-foreground">{account.account_email}</span>
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground tabular-nums">{account.request_count.toLocaleString()}</TableCell>
                                                <TableCell className="text-right text-xs text-blue-600/90 dark:text-blue-400/90 tabular-nums">{formatNumber(account.total_input_tokens)}</TableCell>
                                                <TableCell className="text-right text-xs text-purple-600/90 dark:text-purple-400/90 tabular-nums">{formatNumber(account.total_output_tokens)}</TableCell>
                                                <TableCell className="text-right text-xs font-bold tabular-nums">{formatNumber(account.total_tokens)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </PageContainer>
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
    );
};

export default TokenStats;
