import { useTranslation } from "react-i18next";
import { Zap, Scale, Database } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { StickySessionConfig } from "../../types/config";
import { cn } from "../../lib/utils";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsItem } from "../settings/SettingsItem";

interface SchedulingConfigProps {
    config: StickySessionConfig;
    onChange: (newConfig: StickySessionConfig) => void;
    disabled?: boolean;
}

export function SchedulingConfigCard({ config, onChange, disabled }: SchedulingConfigProps) {
    const { t } = useTranslation();

    const updateConfig = (key: keyof StickySessionConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    return (
        <SettingsCard
            title={t('proxy.config.scheduling.title')}
            description={t('proxy.config.scheduling.subtitle')}
        >
            <SettingsItem
                title={t('proxy.config.scheduling.mode')}
                description="Select the traffic scheduling strategy"
                vertical={true}
            >
                <div className="w-full">
                    <RadioGroup
                        value={config.mode}
                        onValueChange={(v: any) => updateConfig("mode", v)}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3"
                        disabled={disabled}
                    >
                        <div
                            onClick={() => !disabled && updateConfig("mode", "CacheFirst")}
                            className={cn(
                                "flex flex-col space-y-2 border rounded-lg p-3 cursor-pointer transition-all duration-200",
                                config.mode === 'CacheFirst'
                                    ? "bg-cyan-500/5 border-cyan-500/30 ring-1 ring-cyan-500/10"
                                    : "bg-white dark:bg-muted/5 border-border/40 hover:border-border"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 rounded-md", config.mode === 'CacheFirst' ? "bg-cyan-500/10 text-cyan-500" : "bg-muted text-muted-foreground")}>
                                        <Database className="h-3.5 w-3.5" />
                                    </div>
                                    <Label className="font-medium text-[12px] cursor-pointer leading-snug">
                                        {t('proxy.config.scheduling.modes.CacheFirst')}
                                    </Label>
                                </div>
                                <RadioGroupItem value="CacheFirst" />
                            </div>
                            <p className="text-[11px] text-muted-foreground/70 leading-normal">
                                {t('proxy.config.scheduling.modes_desc.CacheFirst')}
                            </p>
                        </div>

                        <div
                            onClick={() => !disabled && updateConfig("mode", "Balance")}
                            className={cn(
                                "flex flex-col space-y-2 border rounded-lg p-3 cursor-pointer transition-all duration-200",
                                config.mode === 'Balance'
                                    ? "bg-primary/5 border-primary/30 ring-1 ring-primary/10"
                                    : "bg-white dark:bg-muted/5 border-border/40 hover:border-border"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 rounded-md", config.mode === 'Balance' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                                        <Scale className="h-3.5 w-3.5" />
                                    </div>
                                    <Label className="font-medium text-[12px] cursor-pointer leading-snug">
                                        {t('proxy.config.scheduling.modes.Balance')}
                                    </Label>
                                </div>
                                <RadioGroupItem value="Balance" />
                            </div>
                            <p className="text-[11px] text-muted-foreground/70 leading-normal">
                                {t('proxy.config.scheduling.modes_desc.Balance')}
                            </p>
                        </div>

                        <div
                            onClick={() => !disabled && updateConfig("mode", "PerformanceFirst")}
                            className={cn(
                                "flex flex-col space-y-2 border rounded-lg p-3 cursor-pointer transition-all duration-200",
                                config.mode === 'PerformanceFirst'
                                    ? "bg-amber-500/5 border-amber-500/30 ring-1 ring-amber-500/10"
                                    : "bg-white dark:bg-muted/5 border-border/40 hover:border-border"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 rounded-md", config.mode === 'PerformanceFirst' ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground")}>
                                        <Zap className="h-3.5 w-3.5" />
                                    </div>
                                    <Label className="font-medium text-[12px] cursor-pointer leading-snug">
                                        {t('proxy.config.scheduling.modes.PerformanceFirst')}
                                    </Label>
                                </div>
                                <RadioGroupItem value="PerformanceFirst" />
                            </div>
                            <p className="text-[11px] text-muted-foreground/70 leading-normal">
                                {t('proxy.config.scheduling.modes_desc.PerformanceFirst')}
                            </p>
                        </div>
                    </RadioGroup>
                </div>
            </SettingsItem>

            {config.mode === 'CacheFirst' && (
                <SettingsItem
                    title={t('proxy.config.scheduling.max_wait')}
                    description="Maximum time to wait for a cached response"
                >
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={config.max_wait_seconds}
                            onChange={(e) => updateConfig("max_wait_seconds", parseInt(e.target.value))}
                            className="w-20 h-8 text-[12px] font-medium text-center bg-muted/20 leading-snug"
                            min={0}
                            disabled={disabled}
                        />
                        <span className="text-[11px] font-medium text-muted-foreground/40 leading-snug">Seconds</span>
                    </div>
                </SettingsItem>
            )}
        </SettingsCard>
    );
}
