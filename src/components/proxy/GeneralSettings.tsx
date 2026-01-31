import { useTranslation } from "react-i18next";
import { RefreshCw, Smartphone, Globe, Shield, AlertTriangle, Key, Zap } from "lucide-react";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ProxyConfig } from "../../types/config";
import { generateApiKey } from "../../lib/utils";
import { showToast } from "../common/ToastContainer";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsItem } from "../settings/SettingsItem";

interface GeneralSettingsProps {
    config: ProxyConfig;
    onChange: (key: keyof ProxyConfig, value: any) => void;
    disabled?: boolean;
}

export function GeneralSettings({ config, onChange, disabled }: GeneralSettingsProps) {
    const { t } = useTranslation();

    const handleRegenerateKey = () => {
        const newKey = generateApiKey();
        onChange("api_key", newKey);
        showToast(t('proxy.config.api_key_updated'), 'success');
    };

    const copyKey = () => {
        navigator.clipboard.writeText(config.api_key);
        showToast(t('proxy.config.btn_copied'), 'success');
    };

    return (
        <div className="space-y-6">
            <SettingsCard title={t('proxy.config.title')} description={t('proxy.config.desc')}>
                {/* Port */}
                <SettingsItem
                    icon={Smartphone}
                    title={t('proxy.config.port')}
                    description={t('proxy.config.port_hint')}
                >
                    <Input
                        type="number"
                        className="w-24 h-8 text-[12px] bg-muted/30"
                        value={config.port}
                        onChange={(e) => onChange("port", parseInt(e.target.value))}
                        disabled={disabled}
                    />
                </SettingsItem>

                {/* Auto Start */}
                <SettingsItem
                    icon={Zap}
                    title={t('proxy.config.auto_start')}
                    description={t('proxy.config.auto_start_tooltip')}
                >
                    <Switch
                        id="auto-start"
                        size="sm"
                        checked={config.auto_start}
                        onCheckedChange={(checked) => {
                            console.log('🔵 Switch clicked! New value:', checked);
                            onChange("auto_start", checked);
                            console.log('🔵 onChange called');
                        }}
                        disabled={disabled}
                    />
                </SettingsItem>

                {/* LAN Access */}
                <SettingsItem
                    icon={Globe}
                    title={t('proxy.config.allow_lan_access')}
                    description={config.allow_lan_access ? t('proxy.config.allow_lan_access_hint_enabled') : t('proxy.config.allow_lan_access_hint_disabled')}
                >
                    <Switch
                        size="sm"
                        checked={config.allow_lan_access}
                        onCheckedChange={(checked) => onChange("allow_lan_access", checked)}
                        disabled={disabled}
                    />
                </SettingsItem>

                {config.allow_lan_access && (
                    <div className="px-3 py-2 bg-orange-50/30 dark:bg-orange-950/20 flex items-start gap-2 border-t border-border/20">
                        <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-orange-500" />
                        <span className="text-[11px] text-orange-600 dark:text-orange-400 font-normal leading-relaxed">
                            {t('proxy.config.allow_lan_access_warning')}
                        </span>
                    </div>
                )}
            </SettingsCard>

            <SettingsCard title={t('proxy.config.auth_title')} description={t('proxy.config.warning_key')}>
                {/* Auth Mode */}
                <SettingsItem
                    icon={Shield}
                    title={t('proxy.config.auth.mode')}
                    description="Control how requests are authenticated"
                >
                    <Select
                        value={config.auth_mode || 'off'}
                        onValueChange={(value) => onChange("auth_mode", value)}
                        disabled={disabled}
                    >
                        <SelectTrigger className="w-[180px] h-8 text-[12px] bg-muted/30">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="off">{t('proxy.config.auth.modes.off')}</SelectItem>
                            <SelectItem value="strict">{t('proxy.config.auth.modes.strict')}</SelectItem>
                            <SelectItem value="all_except_health">{t('proxy.config.auth.modes.all_except_health')}</SelectItem>
                            <SelectItem value="auto">{t('proxy.config.auth.modes.auto')}</SelectItem>
                        </SelectContent>
                    </Select>
                </SettingsItem>

                {/* API Key */}
                <SettingsItem
                    icon={Key}
                    title={t('proxy.config.api_key')}
                    description="Required for authenticated requests"
                >
                    <div className="flex gap-2 min-w-[320px]">
                        <div className="relative flex-1">
                            <Input
                                value={config.api_key}
                                readOnly
                                className="font-mono text-[12px] h-8 pr-16 bg-muted/40"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-0.5 top-0.5 h-7 text-[12px] text-muted-foreground hover:text-foreground font-medium"
                                onClick={copyKey}
                            >
                                {t('proxy.config.btn_copy')}
                            </Button>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-[12px] shrink-0 font-medium tracking-tight"
                            onClick={handleRegenerateKey}
                            disabled={disabled}
                        >
                            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                            {t('proxy.config.btn_regenerate')}
                        </Button>
                    </div>
                </SettingsItem>
            </SettingsCard>
        </div>
    );
}
