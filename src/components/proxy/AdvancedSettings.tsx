import { useTranslation } from "react-i18next";
import { Clock, FileText } from "lucide-react";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { ProxyConfig } from "../../types/config";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsItem } from "../settings/SettingsItem";

interface AdvancedSettingsProps {
    config: ProxyConfig;
    onChange: (key: keyof ProxyConfig, value: any) => void;
    disabled?: boolean;
}

export function AdvancedSettings({ config, onChange, disabled }: AdvancedSettingsProps) {
    const { t } = useTranslation();

    return (
        <SettingsCard
            title={t('settings.tabs.advanced')}
            description="Fine-tune proxy behavior"
        >
            <SettingsItem
                icon={Clock}
                title={t('proxy.config.request_timeout')}
                description={t('proxy.config.request_timeout_hint')}
            >
                <div className="flex items-center gap-2">
                    <Input
                        type="number"
                        className="w-24 h-8 text-right bg-muted/30 text-[12px]"
                        value={config.request_timeout}
                        onChange={(e) => onChange("request_timeout", parseInt(e.target.value))}
                        disabled={disabled}
                        min={30}
                        max={7200}
                    />
                    <span className="text-[11px] font-normal text-muted-foreground/70 leading-tight">Sec</span>
                </div>
            </SettingsItem>

            <SettingsItem
                icon={FileText}
                title={t('proxy.config.enable_logging')}
                description={t('proxy.config.enable_logging_hint')}
            >
                <Switch
                    size="sm"
                    checked={config.enable_logging}
                    onCheckedChange={(checked) => onChange("enable_logging", checked)}
                    disabled={disabled}
                />
            </SettingsItem>
        </SettingsCard>
    );
}
