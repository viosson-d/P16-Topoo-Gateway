import { useMemo } from 'react';
import { TrendingUp, Sparkles, Bot, Zap } from 'lucide-react';
import { Account } from '../../types/account';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface BestAccountsProps {
    accounts: Account[];
    currentAccountId?: string;
    onSwitch?: (accountId: string) => void;
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
            return {
                ...a,
                quotaVal: Math.round(proQuota * 0.7 + flashQuota * 0.3),
            };
        })
        .filter(a => a.quotaVal > 0)
        .sort((a, b) => b.quotaVal - a.quotaVal), [accounts, currentAccountId]);

    const claudeSorted = useMemo(() => accounts
        .filter(a => a.id !== currentAccountId)
        .map(a => ({
            ...a,
            quotaVal: (a.quota?.models || []).find(m => m.name.toLowerCase().includes('claude'))?.percentage || 0,
        }))
        .filter(a => a.quotaVal > 0)
        .sort((a, b) => b.quotaVal - a.quotaVal), [accounts, currentAccountId]);

    let bestGemini = geminiSorted[0];
    let bestClaude = claudeSorted[0];

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
}

export default BestAccounts;
