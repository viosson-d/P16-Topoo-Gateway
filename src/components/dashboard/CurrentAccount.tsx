<<<<<<< HEAD
import { CheckCircle, Mail, Diamond, Gem, Circle } from 'lucide-react';
import { Account } from '../../types/account';
import { formatTimeRemaining } from '../../utils/format';
=======
import { CheckCircle, Zap } from 'lucide-react';
import { Account } from '../../types/account';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)

interface CurrentAccountProps {
    account: Account | null;
    onSwitch?: () => void;
<<<<<<< HEAD
}

import { useTranslation } from 'react-i18next';

function CurrentAccount({ account, onSwitch }: CurrentAccountProps) {
    const { t } = useTranslation();
    if (!account) {
        return (
            <div className="bg-white dark:bg-base-100 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-base-200">
                <h2 className="text-base font-semibold text-gray-900 dark:text-base-content mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {t('dashboard.current_account')}
                </h2>
                <div className="text-center py-4 text-gray-400 dark:text-gray-500 text-sm">
                    {t('dashboard.no_active_account')}
=======
    className?: string;
}

function CurrentAccount({ account, onSwitch, className }: CurrentAccountProps) {
    const { t } = useTranslation();

    const cardStyle = { fontFamily: "'Geist', sans-serif" };

    if (!account) {
        return (
            <div className={cn("space-y-3", className)} style={cardStyle}>
                <div className="bg-white dark:bg-muted/5 rounded-lg border border-border/40 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium text-foreground/80 tracking-tight">
                                {t('dashboard.current_account')}
                            </span>
                        </div>
                    </div>
                    <div className="p-5 flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground/50">{t('dashboard.no_active_account')}</p>
                    </div>
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
                </div>
            </div>
        );
    }

    const geminiProModel = account.quota?.models.find(m => m.name === 'gemini-3-pro-high');
<<<<<<< HEAD
    const geminiFlashModel = account.quota?.models.find(m => m.name === 'gemini-3-flash');
    const claudeModel = account.quota?.models.find(m => m.name === 'claude-sonnet-4-5-thinking');

    return (
        <div className="bg-white dark:bg-base-100 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-base-200 h-full flex flex-col">
            <h2 className="text-base font-semibold text-gray-900 dark:text-base-content mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {t('dashboard.current_account')}
            </h2>

            <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{account.email}</span>
                    </div>
                    {/* 订阅类型 */}
                    {account.quota?.subscription_tier && (() => {
                        const tier = account.quota.subscription_tier.toLowerCase();
                        if (tier.includes('ultra')) {
                            return (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[10px] font-bold shadow-sm shrink-0">
                                    <Gem className="w-2.5 h-2.5 fill-current" />
                                    ULTRA
                                </span>
                            );
                        } else if (tier.includes('pro')) {
                            return (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold shadow-sm shrink-0">
                                    <Diamond className="w-2.5 h-2.5 fill-current" />
                                    PRO
                                </span>
                            );
                        } else {
                            return (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 text-[10px] font-bold shadow-sm border border-gray-200 dark:border-white/10 shrink-0">
                                    <Circle className="w-2.5 h-2.5" />
                                    FREE
                                </span>
                            );
                        }
                    })()}
                </div>

                {/* Gemini Pro 配额 */}
                {geminiProModel && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Gemini 3 Pro</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500" title={`${t('accounts.reset_time')}: ${new Date(geminiProModel.reset_time).toLocaleString()}`}>
                                    {geminiProModel.reset_time ? `R: ${formatTimeRemaining(geminiProModel.reset_time)}` : t('common.unknown')}
                                </span>
                                <span className={`text-xs font-bold ${geminiProModel.percentage >= 50 ? 'text-emerald-600 dark:text-emerald-400' :
                                    geminiProModel.percentage >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                    {geminiProModel.percentage}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-base-300 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${geminiProModel.percentage >= 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                    geminiProModel.percentage >= 20 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                        'bg-gradient-to-r from-rose-400 to-rose-500'
                                    }`}
                                style={{ width: `${geminiProModel.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Gemini Flash 配额 */}
                {geminiFlashModel && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Gemini 3 Flash</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500" title={`${t('accounts.reset_time')}: ${new Date(geminiFlashModel.reset_time).toLocaleString()}`}>
                                    {geminiFlashModel.reset_time ? `R: ${formatTimeRemaining(geminiFlashModel.reset_time)}` : t('common.unknown')}
                                </span>
                                <span className={`text-xs font-bold ${geminiFlashModel.percentage >= 50 ? 'text-emerald-600 dark:text-emerald-400' :
                                    geminiFlashModel.percentage >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                    {geminiFlashModel.percentage}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-base-300 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${geminiFlashModel.percentage >= 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                    geminiFlashModel.percentage >= 20 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                        'bg-gradient-to-r from-rose-400 to-rose-500'
                                    }`}
                                style={{ width: `${geminiFlashModel.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Claude 配额 */}
                {claudeModel && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Claude 4.5</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 dark:text-gray-500" title={`${t('accounts.reset_time')}: ${new Date(claudeModel.reset_time).toLocaleString()}`}>
                                    {claudeModel.reset_time ? `R: ${formatTimeRemaining(claudeModel.reset_time)}` : t('common.unknown')}
                                </span>
                                <span className={`text-xs font-bold ${claudeModel.percentage >= 50 ? 'text-cyan-600 dark:text-cyan-400' :
                                    claudeModel.percentage >= 20 ? 'text-orange-600 dark:text-orange-400' : 'text-rose-600 dark:text-rose-400'
                                    }`}>
                                    {claudeModel.percentage}%
                                </span>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-base-300 rounded-full h-1.5 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${claudeModel.percentage >= 50 ? 'bg-gradient-to-r from-cyan-400 to-cyan-500' :
                                    claudeModel.percentage >= 20 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                                        'bg-gradient-to-r from-rose-400 to-rose-500'
                                    }`}
                                style={{ width: `${claudeModel.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            {onSwitch && (
                <div className="mt-auto pt-3">
                    <button
                        className="w-full px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-base-300 rounded-lg hover:bg-gray-50 dark:hover:bg-base-200 transition-colors"
                        onClick={onSwitch}
                    >
                        {t('dashboard.switch_account')}
                    </button>
                </div>
            )}
=======
    const claudeModel = account.quota?.models.find(m => m.name === 'claude-sonnet-4-5-thinking');

    return (
        <div className={cn("space-y-3 animate-in fade-in duration-500", className)} style={cardStyle}>
            {/* SettingsCard style container */}
            <div className="bg-white dark:bg-muted/5 rounded-lg border border-border/40 overflow-hidden shadow-sm">
                {/* Header with Switch Button */}
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-foreground/80 tracking-tight">
                            {t('dashboard.current_account')}
                        </span>
                    </div>

                    {onSwitch && (
                        <button
                            onClick={onSwitch}
                            className="text-[11px] font-medium text-primary/60 hover:text-primary transition-all flex items-center gap-1 active:scale-95"
                        >
                            <span>{t('dashboard.switch_account')}</span>
                            <Zap className="w-3 h-3" />
                        </button>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    {/* Compact Primary Info */}
                    <div className="flex items-baseline justify-between gap-2 overflow-hidden">
                        <span className="text-[13px] font-medium tracking-tight truncate text-foreground/90 leading-none">
                            {account.email}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40 font-medium tracking-tight tabular-nums flex-shrink-0">
                            ID: {account.id.slice(0, 8).toUpperCase()}
                        </span>
                    </div>

                    {/* Minimal Quotas */}
                    <div className="grid grid-cols-2 gap-4 pb-0.5">
                        {geminiProModel && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-0.5">
                                    <span className="text-[11px] font-medium text-foreground/50 leading-none">Gemini</span>
                                    <span className="text-[11px] font-bold tabular-nums text-foreground/70">{geminiProModel.percentage}%</span>
                                </div>
                                <div className="h-1 w-full bg-muted/20 rounded-sm overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-700 ease-in-out",
                                            "bg-secondary"
                                        )}
                                        style={{ width: `${geminiProModel.percentage}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {claudeModel && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-0.5">
                                    <span className="text-[11px] font-medium text-foreground/50 leading-none">Claude</span>
                                    <span className="text-[11px] font-bold tabular-nums text-foreground/70">{claudeModel.percentage}%</span>
                                </div>
                                <div className="h-1 w-full bg-muted/20 rounded-sm overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-700 ease-in-out",
                                            "bg-secondary"
                                        )}
                                        style={{ width: `${claudeModel.percentage}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
>>>>>>> c37e387c (Initial commit of Topoo Gateway P16)
        </div>
    );
}

export default CurrentAccount;
