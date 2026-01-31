import { Globe } from "lucide-react";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsItem } from "../settings/SettingsItem";
import { useTranslation } from "react-i18next";

interface UpstreamProxyConfigProps {
    config: {
        enabled: boolean;
        url: string;
    };
    onChange: (key: string, value: any) => void;
}

export function UpstreamProxyConfig({ config, onChange }: UpstreamProxyConfigProps) {
    const { t } = useTranslation();

    return (
        <SettingsCard
            title={t('proxy.config.upstream_proxy.title')}
            description={t('proxy.config.upstream_proxy.desc')}
        >
            <SettingsItem
                icon={Globe}
                title={t('proxy.config.upstream_proxy.enable')}
                description={t('proxy.config.upstream_proxy.tip')}
            >
                <Switch
                    size="sm"
                    checked={config.enabled}
                    onCheckedChange={(checked) => onChange('enabled', checked)}
                />
            </SettingsItem>

            {config.enabled && (
                <div className="px-3 pb-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col gap-2 p-3 rounded-lg border border-border/40 bg-muted/10">
                        <span className="text-[10px] font-bold text-muted-foreground/60 tracking-tight uppercase px-1">
                            {t('proxy.config.upstream_proxy.url')}
                        </span>
                        <Input
                            placeholder="http://127.0.0.1:7890"
                            value={config.url}
                            onChange={(e) => onChange('url', e.target.value)}
                            className="h-8 text-xs bg-white dark:bg-muted/10 border-border/40"
                        />
                    </div>
                </div>
            )}
        </SettingsCard>
    );
}
