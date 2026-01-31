import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { Sparkles, Terminal, Globe, Eye, Link2, FileText, Navigation } from "lucide-react";

import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ZaiConfig } from "../../types/config";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsItem } from "../settings/SettingsItem";

interface ZaiConfigProps {
    config: ZaiConfig;
    onChange: (newConfig: ZaiConfig) => void;
    disabled?: boolean;
}

export function ZaiConfigCard({ config, onChange, disabled }: ZaiConfigProps) {
    const { t } = useTranslation();

    const updateConfig = (key: keyof ZaiConfig, value: any) => {
        onChange({ ...config, [key]: value });
    };

    const updateMcp = (key: keyof ZaiConfig['mcp'], value: boolean) => {
        onChange({
            ...config,
            mcp: { ...config.mcp, [key]: value }
        });
    };

    return (
        <SettingsCard
            title={t('proxy.config.zai.title')}
            description={t('proxy.config.zai.subtitle')}
        >
            {/* Enable/Disable Toggle */}
            <SettingsItem
                icon={Sparkles}
                title={t('proxy.config.zai.enabled')}
                description={t('proxy.config.zai.enabled_tooltip')}
            >
                <Switch
                    size="sm"
                    checked={config.enabled}
                    onCheckedChange={(c) => updateConfig("enabled", c)}
                    disabled={disabled}
                />
            </SettingsItem>

            {config.enabled && (
                <div className="animate-in slide-in-from-top-2 duration-300 divide-y divide-border/20">
                    {/* Basic Config */}
                    <SettingsItem
                        icon={Link2}
                        title={t('proxy.config.zai.base_url')}
                        description={t('proxy.config.zai.base_url_tooltip')}
                    >
                        <Input
                            value={config.base_url}
                            onChange={(e) => updateConfig("base_url", e.target.value)}
                            disabled={disabled}
                            className="w-[280px] h-8 font-mono text-[10px] bg-muted/30"
                        />
                    </SettingsItem>

                    <SettingsItem
                        icon={Terminal}
                        title={t('proxy.config.zai.api_key')}
                        description={t('proxy.config.zai.api_key_tooltip')}
                    >
                        <Input
                            type="password"
                            value={config.api_key}
                            onChange={(e) => updateConfig("api_key", e.target.value)}
                            disabled={disabled}
                            placeholder={t('proxy.config.zai.api_key_placeholder')}
                            className="w-[280px] h-8 font-mono text-[10px] bg-muted/30"
                        />
                    </SettingsItem>

                    {/* Dispatch Mode */}
                    <SettingsItem
                        icon={Navigation}
                        title={t('proxy.config.zai.dispatch_mode')}
                        description={t('proxy.config.zai.dispatch_mode_tooltip')}
                    >
                        <Select
                            value={config.dispatch_mode}
                            onValueChange={(v) => updateConfig("dispatch_mode", v)}
                            disabled={disabled}
                        >
                            <SelectTrigger className="w-[180px] h-8 text-xs bg-muted/30">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="off">{t('proxy.config.zai.modes.off')}</SelectItem>
                                <SelectItem value="exclusive">{t('proxy.config.zai.modes.exclusive')}</SelectItem>
                                <SelectItem value="pooled">{t('proxy.config.zai.modes.pooled')}</SelectItem>
                                <SelectItem value="fallback">{t('proxy.config.zai.modes.fallback')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </SettingsItem>

                    {/* MCP Section */}
                    <div className="bg-muted/10">
                        <SettingsItem
                            icon={Terminal}
                            title={t('proxy.config.zai.mcp.title')}
                            description={t('proxy.config.zai.mcp.enabled_tooltip')}
                        >
                            <Switch
                                size="sm"
                                checked={config.mcp.enabled}
                                onCheckedChange={(c) => updateMcp("enabled", c)}
                                disabled={disabled}
                            />
                        </SettingsItem>

                        {config.mcp.enabled && (
                            <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-border/10 pt-2 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between border border-border/30 bg-white dark:bg-muted/5 p-2 rounded-md transition-colors hover:bg-zinc-50/50 dark:hover:bg-muted/10">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Globe className={cn("h-3 w-3 shrink-0 transition-colors", config.mcp.web_search_enabled ? "text-blue-500" : "text-muted-foreground/60")} />
                                        <span className={cn("text-[10px] font-medium truncate transition-colors", config.mcp.web_search_enabled ? "text-foreground" : "text-muted-foreground")}>{t('proxy.config.zai.mcp.web_search')}</span>
                                    </div>
                                    <Switch
                                        size="sm"
                                        checked={config.mcp.web_search_enabled}
                                        onCheckedChange={(c) => updateMcp("web_search_enabled", c)}
                                        disabled={disabled}
                                    />
                                </div>
                                <div className="flex items-center justify-between border border-border/30 bg-white dark:bg-muted/5 p-2 rounded-md transition-colors hover:bg-zinc-50/50 dark:hover:bg-muted/10">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText className={cn("h-3 w-3 shrink-0 transition-colors", config.mcp.web_reader_enabled ? "text-blue-500" : "text-muted-foreground/60")} />
                                        <span className={cn("text-[10px] font-medium truncate transition-colors", config.mcp.web_reader_enabled ? "text-foreground" : "text-muted-foreground")}>{t('proxy.config.zai.mcp.web_reader')}</span>
                                    </div>
                                    <Switch
                                        size="sm"
                                        checked={config.mcp.web_reader_enabled}
                                        onCheckedChange={(c) => updateMcp("web_reader_enabled", c)}
                                        disabled={disabled}
                                    />
                                </div>
                                <div className="flex items-center justify-between border border-border/30 bg-white dark:bg-muted/5 p-2 rounded-md transition-colors hover:bg-zinc-50/50 dark:hover:bg-muted/10">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Eye className={cn("h-3 w-3 shrink-0 transition-colors", config.mcp.vision_enabled ? "text-orange-500" : "text-muted-foreground/60")} />
                                        <span className={cn("text-[10px] font-medium truncate transition-colors", config.mcp.vision_enabled ? "text-foreground" : "text-muted-foreground")}>{t('proxy.config.zai.mcp.vision')}</span>
                                    </div>
                                    <Switch
                                        size="sm"
                                        checked={config.mcp.vision_enabled}
                                        onCheckedChange={(c) => updateMcp("vision_enabled", c)}
                                        disabled={disabled}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </SettingsCard>
    );
}
