import { CheckCircle, Zap } from 'lucide-react';
import { Account } from '../../types/account';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface CurrentAccountProps {
    account: Account | null;
    onSwitch?: () => void;
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
                </div>
            </div>
        );
    }

    const geminiProModel = account.quota?.models.find(m => m.name === 'gemini-3-pro-high');
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
        </div>
    );
}

export default CurrentAccount;
