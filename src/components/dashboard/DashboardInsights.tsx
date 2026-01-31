import { LucideIcon, Sparkles, Bot, AlertTriangle, Users } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    description?: string;
}

function StatCard({ icon: Icon, title, value, description }: StatCardProps) {
    return (
        <div className="bg-white/50 dark:bg-white/[0.02] border border-codmate-border dark:border-codmate-border-dark rounded-codmate p-4 shadow-codmate flex flex-col justify-between min-h-[120px] transition-all hover:bg-white/80 dark:hover:bg-white/[0.04]">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-medium text-foreground/90 tracking-tight leading-snug">
                        {title}
                    </span>
                    {description && (
                        <p className="text-[11px] text-muted-foreground/60 leading-snug">{description}</p>
                    )}
                </div>
                <div className="w-8 h-8 rounded-lg bg-zinc-100/50 dark:bg-white/5 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>
            </div>

            <div className="mt-4">
                <h2 className="text-[20px] font-medium tracking-tight text-foreground/90 tabular-nums leading-none">
                    {value !== undefined && value !== null && value !== 'undefined%' ? value : '0'}
                </h2>
            </div>
        </div>
    );
}

interface DashboardInsightsProps {
    stats: {
        total: number;
        avgGemini: number;
        avgClaude: number;
        lowQuota: number;
    };
    t: (key: string, options?: any) => string;
}

export function DashboardInsights({ stats, t }: DashboardInsightsProps) {
    return (
        <>
            <StatCard
                icon={Users}
                title={t('dashboard.total_accounts')}
                value={stats.total}
                description={t('dashboard.insights.fleet_size')}
            />
            <StatCard
                icon={Sparkles}
                title={t('dashboard.avg_gemini')}
                value={`${stats.avgGemini}%`}
                description={t('dashboard.insights.efficiency')}
            />
            <StatCard
                icon={Bot}
                title={t('dashboard.avg_claude')}
                value={`${stats.avgClaude}%`}
                description={t('dashboard.insights.status')}
            />
            <StatCard
                icon={AlertTriangle}
                title={t('dashboard.low_quota_accounts')}
                value={stats.lowQuota}
                description={stats.lowQuota > 0 ? t('dashboard.insights.attention') : t('dashboard.insights.status_good')}
            />
        </>
    );
}
