import { useTranslation } from "react-i18next";
import { Code2, Cpu, RefreshCw, Check, Globe } from "lucide-react";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsItem } from "../settings/SettingsItem";
import { Button } from "../ui/button";
import { useState } from "react";
import { showToast } from "../common/ToastContainer";
import { cn } from "@/lib/utils";

export function CliSyncSection() {
    const { t } = useTranslation();
    const [synced, setSynced] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const handleSync = async (key: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setLoading(prev => ({ ...prev, [key]: true }));
        // Mock sync delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(prev => ({ ...prev, [key]: false }));
        setSynced(prev => ({ ...prev, [key]: true }));
        showToast(t('common.saved'), 'success');

        setTimeout(() => {
            setSynced(prev => ({ ...prev, [key]: false }));
        }, 3000);
    };

    const tools = [
        { key: 'claude', name: 'Claude', icon: Code2, color: 'text-orange-500', bg: 'bg-orange-500/10', activeBg: 'bg-orange-500/5', activeBorder: 'border-orange-500/30', activeRing: 'ring-orange-500/10' },
        { key: 'codex', name: 'OpenAI', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10', activeBg: 'bg-blue-500/5', activeBorder: 'border-blue-500/30', activeRing: 'ring-blue-500/10' },
        { key: 'gemini', name: 'Gemini', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10', activeBg: 'bg-purple-500/5', activeBorder: 'border-purple-500/30', activeRing: 'ring-purple-500/10' },
    ];

    return (
        <SettingsCard
            title={t('proxy.cli_sync.title')}
            description={t('proxy.cli_sync.subtitle')}
        >
            <SettingsItem
                title="Configuration Sync"
                description="Quickly sync current API endpoints and keys to your local AI CLI tools."
                vertical={true}
            >
                <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {tools.map((tool) => (
                            <div
                                key={tool.key}
                                className={cn(
                                    "flex flex-col space-y-3 border rounded-lg p-3 transition-all duration-200 group relative",
                                    synced[tool.key]
                                        ? cn(tool.activeBg, tool.activeBorder, "ring-1", tool.activeRing)
                                        : "bg-white dark:bg-muted/5 border-border/40 hover:border-border"
                                )}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col gap-0.5">
                                        <h4 className="text-[12px] font-medium text-foreground leading-tight truncate">
                                            {t('proxy.cli_sync.card_title', { name: tool.name })}
                                        </h4>
                                        <span className="text-[11px] text-muted-foreground/70 font-normal">
                                            {synced[tool.key] ? t('proxy.cli_sync.status.synced') : t('proxy.cli_sync.status.not_installed')}
                                        </span>
                                    </div>

                                    {/* Tool Icon - Aligned with title */}
                                    <div className={cn("p-1.5 rounded-md transition-colors shrink-0", synced[tool.key] ? cn(tool.bg, tool.color) : "bg-muted/50 text-muted-foreground")}>
                                        <tool.icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    </div>
                                    {synced[tool.key] && (
                                        <div className="text-emerald-500 animate-in fade-in zoom-in duration-300">
                                            <Check className="h-3.5 w-3.5" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 mt-auto">
                                    <div className="flex flex-col gap-1 group/field mt-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-muted-foreground/60 font-medium tracking-tight">Base URL</span>
                                        </div>
                                        <div className="text-[11px] font-mono bg-muted/30 text-muted-foreground/80 border border-border/20 px-2.5 py-1.5 rounded-md truncate select-all transition-colors group-hover/field:bg-muted/50 group-hover/field:text-muted-foreground cursor-text">
                                            http://127.0.0.1:xxx/v1
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-[11px] h-7 font-medium shadow-none bg-transparent border-border/60 hover:bg-zinc-50 dark:hover:bg-muted/10 transition-all active:scale-[0.98]"
                                        onClick={(e) => handleSync(tool.key, e)}
                                        disabled={loading[tool.key] || synced[tool.key]}
                                    >
                                        {loading[tool.key] ? (
                                            <RefreshCw className="h-3 w-3 mr-1.5 animate-spin text-muted-foreground" />
                                        ) : (
                                            !synced[tool.key] && <RefreshCw className="h-3 w-3 mr-1.5 text-muted-foreground/60 w-group-hover:text-muted-foreground" />
                                        )}
                                        {synced[tool.key] ? t('proxy.cli_sync.status.synced') : t('proxy.cli_sync.btn_sync')}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SettingsItem>
        </SettingsCard>
    );
}
