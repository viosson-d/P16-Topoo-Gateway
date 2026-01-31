<<<<<<< HEAD
import { TrendingUp } from 'lucide-react';
import { Account } from '../../types/account';
=======
import { useMemo } from 'react';
import { TrendingUp, Sparkles, Bot, Zap } from 'lucide-react';
import { Account } from '../../types/account';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

interface BestAccountsProps {
    accounts: Account[];
    currentAccountId?: string;
    onSwitch?: (accountId: string) => void;
<<<<<<< HEAD
}

import { useTranslation } from 'react-i18next';

function BestAccounts({ accounts, currentAccountId, onSwitch }: BestAccountsProps) {
    const { t } = useTranslation();
    // 1. 获取按配额排序的列表 (排除当前账号)
    const geminiSorted = accounts
        .filter(a => a.id !== currentAccountId)
        .map(a => {
            const proQuota = a.quota?.models.find(m => m.name.toLowerCase() === 'gemini-3-pro-high')?.percentage || 0;
            const flashQuota = a.quota?.models.find(m => m.name.toLowerCase() === 'gemini-3-flash')?.percentage || 0;
            // 综合评分：Pro 权重更高 (70%)，Flash 权重 30%
=======
    className?: string;
}

function BestAccounts({ accounts, currentAccountId, onSwitch, className }: BestAccountsProps) {
    const { t } = useTranslation();

    const cardStyle = { fontFamily: "'Geist', sans-serif" };

    const geminiSorted = useMemo(() => accounts
        .filter(a => a.id !== currentAccountId)
        .map(a => {
            const models = a.quota?.models || [];
            const proQuota = models.find(m => m.name.toLowerCase() === 'gemini-3-pro-high')?.percentage || 0;
            const flashQuota = models.find(m => m.name.toLowerCase() === 'gemini-3-flash')?.percentage || 0;
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
            return {
                ...a,
                quotaVal: Math.round(proQuota * 0.7 + flashQuota * 0.3),
            };
        })
        .filter(a => a.quotaVal > 0)
<<<<<<< HEAD
        .sort((a, b) => b.quotaVal - a.quotaVal);

    const claudeSorted = accounts
        .filter(a => a.id !== currentAccountId)
        .map(a => ({
            ...a,
            quotaVal: a.quota?.models.find(m => m.name.toLowerCase().includes('claude'))?.percentage || 0,
        }))
        .filter(a => a.quotaVal > 0)
        .sort((a, b) => b.quotaVal - a.quotaVal);
=======
        .sort((a, b) => b.quotaVal - a.quotaVal), [accounts, currentAccountId]);

    const claudeSorted = useMemo(() => accounts
        .filter(a => a.id !== currentAccountId)
        .map(a => ({
            ...a,
            quotaVal: (a.quota?.models || []).find(m => m.name.toLowerCase().includes('claude'))?.percentage || 0,
        }))
        .filter(a => a.quotaVal > 0)
        .sort((a, b) => b.quotaVal - a.quotaVal), [accounts, currentAccountId]);
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

    let bestGemini = geminiSorted[0];
    let bestClaude = claudeSorted[0];

<<<<<<< HEAD
    // 2. 如果推荐是同一个账号，且有其他选择，尝试寻找最优的"不同账号"组合
    if (bestGemini && bestClaude && bestGemini.id === bestClaude.id) {
        const nextGemini = geminiSorted[1];
        const nextClaude = claudeSorted[1];

        // 方案A: 保持 Gemini 最优，换 Claude 次优
        // 方案B: 换 Gemini 次优，保持 Claude 最优
        // 比较标准：两者配额之和最大化 (或者优先保住 100% 的那个)

        const scoreA = bestGemini.quotaVal + (nextClaude?.quotaVal || 0);
        const scoreB = (nextGemini?.quotaVal || 0) + bestClaude.quotaVal;

        if (nextClaude && (!nextGemini || scoreA >= scoreB)) {
            // 选方案A：换 Claude
            bestClaude = nextClaude;
        } else if (nextGemini) {
            // 选方案B：换 Gemini
            bestGemini = nextGemini;
        }
        // 如果都没有次优解（例如只有一个账号），则保持原样
    }

    // 构造最终用于显示的视图模型 (兼容原有渲染逻辑)
    const bestGeminiRender = bestGemini ? { ...bestGemini, geminiQuota: bestGemini.quotaVal } : undefined;
    const bestClaudeRender = bestClaude ? { ...bestClaude, claudeQuota: bestClaude.quotaVal } : undefined;

    return (
        <div className="bg-white dark:bg-base-100 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-base-200 h-full flex flex-col">
            <h2 className="text-base font-semibold text-gray-900 dark:text-base-content mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                {t('dashboard.best_accounts')}
            </h2>

            <div className="space-y-2 flex-1">
                {/* Gemini 最佳 */}
                {bestGeminiRender && (
                    <div className="flex items-center justify-between p-2.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-green-600 dark:text-green-400 font-medium mb-0.5">{t('dashboard.for_gemini')}</div>
                            <div className="font-medium text-sm text-gray-900 dark:text-base-content truncate">
                                {bestGeminiRender.email}
                            </div>
                        </div>
                        <div className="ml-2 px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">
                            {bestGeminiRender.geminiQuota}%
                        </div>
                    </div>
                )}

                {/* Claude 最佳 */}
                {bestClaudeRender && (
                    <div className="flex items-center justify-between p-2.5 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-100 dark:border-cyan-900/30">
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium mb-0.5">{t('dashboard.for_claude')}</div>
                            <div className="font-medium text-sm text-gray-900 dark:text-base-content truncate">
                                {bestClaudeRender.email}
                            </div>
                        </div>
                        <div className="ml-2 px-2 py-0.5 bg-cyan-500 text-white text-xs font-semibold rounded-full">
                            {bestClaudeRender.claudeQuota}%
                        </div>
                    </div>
                )}

                {(!bestGeminiRender && !bestClaudeRender) && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                        {t('accounts.no_data')}
                    </div>
                )}
            </div>

            {(bestGeminiRender || bestClaudeRender) && onSwitch && (
                <div className="mt-auto pt-3">
                    <button
                        className="w-full px-3 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => {
                            // 优先切换到配额更高的账号
                            let targetId = bestGeminiRender?.id;
                            if (bestClaudeRender && (!bestGeminiRender || bestClaudeRender.claudeQuota > bestGeminiRender.geminiQuota)) {
                                targetId = bestClaudeRender.id;
                            }

                            if (onSwitch && targetId) {
                                onSwitch(targetId);
                            }
                        }}
                    >
                        {t('dashboard.switch_best')}
                    </button>
                </div>
            )}
        </div>
    );

=======
    if (bestGemini && bestClaude && bestGemini.id === bestClaude.id) {
        if (bestGemini.quotaVal > bestClaude.quotaVal) {
            bestClaude = claudeSorted[1];
        } else {
            bestGemini = geminiSorted[1];
        }
    }

    const recommendations = useMemo(() => [
        ...(bestGemini ? [{ ...bestGemini, type: 'gemini', icon: Sparkles, color: 'text-emerald-500' }] : []),
        ...(bestClaude ? [{ ...bestClaude, type: 'claude', icon: Bot, color: 'text-indigo-500' }] : [])
    ], [bestGemini, bestClaude]);

    return (
        <div className={cn("flex flex-col space-y-3 h-full animate-in fade-in duration-700 delay-150", className)} style={cardStyle}>
            <div className="bg-white dark:bg-muted/5 rounded-lg border border-border/40 shadow-sm overflow-hidden flex-1">
                {/* Header Inside */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5 text-foreground/40" />
                        <span className="text-[13px] font-medium text-foreground/80 tracking-tight lowercase">
                            {t('dashboard.best_accounts')}
                        </span>
                    </div>
                    {recommendations.length > 0 && onSwitch && (
                        <button
                            onClick={() => {
                                const top = recommendations[0];
                                if (top && onSwitch) onSwitch(top.id);
                            }}
                            className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1 active:scale-95 transition-all"
                        >
                            <span>{t('dashboard.switch_best')}</span>
                            <Zap className="w-2.5 h-2.5" />
                        </button>
                    )}
                </div>

                <div className="divide-y divide-border/10">
                    {recommendations.length > 0 ? recommendations.map((item: any) => (
                        <div
                            key={`${item.id}-${item.type}`}
                            onClick={() => onSwitch?.(item.id)}
                            className="group flex items-center justify-between p-3 px-4 hover:bg-zinc-50 dark:hover:bg-muted/10 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={cn("p-1.5 rounded-md bg-muted/20 border border-transparent group-hover:border-border/20 transition-all", item.color)}>
                                    <item.icon className="w-3.5 h-3.5 opacity-80" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13px] font-medium text-foreground/80 truncate">{item.email}</p>
                                    <p className="text-[10px] text-muted-foreground/50 tracking-tight tabular-nums mt-0.5">{item.type} candidate</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={cn("text-[12px] font-medium tabular-nums", item.color)}>{item.quotaVal}%</span>
                                <div className="w-8 h-0.5 bg-muted/20 rounded-full overflow-hidden">
                                    <div className={cn("h-full rounded-full bg-current opacity-60", item.color)} style={{ width: `${item.quotaVal}%` }} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center justify-center opacity-30 py-8">
                            <Bot className="w-8 h-8 mb-2 stroke-[1.5]" />
                            <p className="text-[11px] font-medium">{t('accounts.no_data')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
}

export default BestAccounts;
