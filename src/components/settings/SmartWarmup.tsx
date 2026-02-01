import React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import { cn } from "@/lib/utils";
import { Check } from 'lucide-react';
import { ScheduledWarmupConfig } from '../../types/config';

interface SmartWarmupProps {
    config: ScheduledWarmupConfig;
    onChange: (config: ScheduledWarmupConfig) => void;
}

const SmartWarmup: React.FC<SmartWarmupProps> = ({ config, onChange }) => {
    const { t } = useTranslation();

    const warmupModelsOptions = [
        { id: 'gemini-3-flash', label: 'Gemini 3 Flash' },
        { id: 'gemini-3-pro-high', label: 'Gemini 3 Pro High' },
        { id: 'claude-sonnet-4-5', label: 'Claude 4.5 Sonnet' },
        { id: 'gemini-3-pro-image', label: 'Gemini 3 Pro Image' }
    ];

    const handleEnabledChange = (enabled: boolean) => {
        let newConfig = { ...config, enabled };
        // 如果开启预热且勾选列表为空，则默认勾选所有核心模型
        if (enabled && (!config.monitored_models || config.monitored_models.length === 0)) {
            newConfig.monitored_models = warmupModelsOptions.map(o => o.id);
        }
        onChange(newConfig);
    };

    const toggleModel = (model: string) => {
        const currentModels = config.monitored_models || [];
        let newModels: string[];

        if (currentModels.includes(model)) {
            // 必须勾选其中一个，不能全取消
            if (currentModels.length <= 1) return;
            newModels = currentModels.filter(m => m !== model);
        } else {
            newModels = [...currentModels, model];
        }

        onChange({ ...config, monitored_models: newModels });
    };

    return (
        <div className="group bg-white dark:bg-muted/5 transition-all duration-200 hover:bg-zinc-50 dark:hover:bg-muted/10">
            <div className="flex items-center justify-between py-2.5 px-3">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-medium text-foreground">{t('settings.warmup.title', '智能预热')}</span>
                    <span className="text-[11px] text-muted-foreground/60">{t('settings.warmup.desc')}</span>
                </div>
                <Switch
                    size="sm"
                    checked={config.enabled}
                    onCheckedChange={handleEnabledChange}
                />
            </div>

            {config.enabled && (
                <div className="px-3 pb-3 pt-3 border-t border-border/50 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3">
                        <div>
                            <div className="flex flex-col gap-1 mb-2">
                                <label className="text-[11px] font-medium text-foreground">
                                    {t('settings.quota_protection.monitored_models_label', '监控模型')}
                                </label>
                                <p className="text-[10px] text-muted-foreground/60">
                                    {t('settings.quota_protection.monitored_models_desc', '勾选需要监控的模型。当选中的任一模型利用率跌破阈值时，将触发保护')}
                                </p>
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {warmupModelsOptions.map((model) => {
                                    const isSelected = config.monitored_models?.includes(model.id);
                                    return (
                                        <div
                                            key={model.id}
                                            onClick={() => toggleModel(model.id)}
                                            className={cn(
                                                "flex items-center justify-between p-2 rounded-md border cursor-pointer transition-all duration-200",
                                                isSelected
                                                    ? "bg-secondary/50 border-secondary-foreground/20 text-foreground"
                                                    : "bg-background border-border hover:border-border/80 text-muted-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            <span className={cn("text-[11px] font-medium truncate pr-2", isSelected ? "text-foreground" : "text-muted-foreground")}>
                                                {model.label}
                                            </span>
                                            {isSelected && (
                                                <div className="w-3 h-3 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
                                                    <Check size={8} strokeWidth={4} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartWarmup;
