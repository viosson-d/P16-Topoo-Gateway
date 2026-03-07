import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import { Bot, FolderSearch, Link2, RefreshCw } from "lucide-react";

import { CodexConfig } from "../../types/config";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsItem } from "../settings/SettingsItem";

interface CodexConfigProps {
    config: CodexConfig;
    onChange: (newConfig: CodexConfig) => void;
    disabled?: boolean;
}

interface CodexProviderStatus {
    enabled: boolean;
    detected_accounts: number;
    auth_path?: string | null;
    accounts_path?: string | null;
    last_error?: string | null;
}

export function CodexConfigCard({ config, onChange, disabled }: CodexConfigProps) {
    const { t } = useTranslation();
    const [status, setStatus] = useState<CodexProviderStatus | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const updateConfig = (key: keyof CodexConfig, value: string | boolean) => {
        onChange({ ...config, [key]: value });
    };

    const refreshStatus = async () => {
        setIsRefreshing(true);
        try {
            const next = await invoke<CodexProviderStatus>("get_codex_provider_status", {
                codex: {
                    ...config,
                    auth_path: config.auth_path?.trim() || null,
                    accounts_path: config.accounts_path?.trim() || null,
                },
            });
            setStatus(next);
        } catch (error) {
            setStatus({
                enabled: config.enabled,
                detected_accounts: 0,
                last_error: error instanceof Error ? error.message : String(error),
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        void refreshStatus();
    }, [config.enabled, config.auth_path, config.accounts_path, config.base_url]);

    return (
        <SettingsCard
            title={t("proxy.config.codex.title", "Codex Provider")}
            description={t("proxy.config.codex.subtitle", "Route Codex / GPT-5 family requests to the real ChatGPT Codex backend instead of the Google proxy path.")}
        >
            <SettingsItem
                icon={Bot}
                title={t("proxy.config.codex.enabled", "Enable Codex upstream")}
                description={t("proxy.config.codex.enabled_tooltip", "Only explicit Codex targets such as gpt-5*, *-codex and /v1/responses Codex requests will be routed to this upstream.")}
            >
                <Switch
                    size="sm"
                    checked={config.enabled}
                    onCheckedChange={(checked) => updateConfig("enabled", checked)}
                    disabled={disabled}
                />
            </SettingsItem>

            {config.enabled && (
                <div className="animate-in slide-in-from-top-2 duration-300 divide-y divide-border/20">
                    <SettingsItem
                        icon={Link2}
                        title={t("proxy.config.codex.base_url", "Backend URL")}
                        description={t("proxy.config.codex.base_url_tooltip", "Codex responses endpoint. Keep the default unless you know you need a different gateway.")}
                    >
                        <Input
                            value={config.base_url}
                            onChange={(e) => updateConfig("base_url", e.target.value)}
                            disabled={disabled}
                            className="w-[320px] h-8 font-mono text-[10px] bg-muted/30"
                        />
                    </SettingsItem>

                    <SettingsItem
                        icon={FolderSearch}
                        title={t("proxy.config.codex.auth_path", "Auth file")}
                        description={t("proxy.config.codex.auth_path_tooltip", "Optional. Leave empty to auto-detect ~/.codex/auth.json. The provider reads access_token and account_id from this file.")}
                    >
                        <Input
                            value={config.auth_path || ""}
                            onChange={(e) => updateConfig("auth_path", e.target.value)}
                            disabled={disabled}
                            placeholder="~/.codex/auth.json"
                            className="w-[320px] h-8 font-mono text-[10px] bg-muted/30"
                        />
                    </SettingsItem>

                    <SettingsItem
                        icon={FolderSearch}
                        title={t("proxy.config.codex.accounts_path", "Accounts file")}
                        description={t("proxy.config.codex.accounts_path_tooltip", "Optional. Leave empty to auto-detect ~/.antigravity_tools/codex_accounts.json. If present, the provider will round-robin these accounts before falling back to auth.json.")}
                    >
                        <Input
                            value={config.accounts_path || ""}
                            onChange={(e) => updateConfig("accounts_path", e.target.value)}
                            disabled={disabled}
                            placeholder="~/.antigravity_tools/codex_accounts.json"
                            className="w-[320px] h-8 font-mono text-[10px] bg-muted/30"
                        />
                    </SettingsItem>

                    <div className="flex flex-col gap-3 px-4 py-3">
                        <div className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/20 px-3 py-2">
                            <div className="min-w-0">
                                <div className="text-[11px] font-medium">
                                    {t("proxy.config.codex.detected_accounts", "Detected Codex accounts")}: {status?.detected_accounts ?? 0}
                                </div>
                                <div className="mt-1 text-[10px] text-muted-foreground font-mono break-all">
                                    {status?.accounts_path || status?.auth_path || t("proxy.config.codex.detect_path_fallback", "No auth source resolved yet")}
                                </div>
                                {status?.last_error && (
                                    <div className="mt-2 text-[10px] text-red-500 break-all">
                                        {status.last_error}
                                    </div>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-[11px]"
                                onClick={() => void refreshStatus()}
                                disabled={disabled || isRefreshing}
                            >
                                <RefreshCw className={`mr-1.5 h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                                {t("common.refresh", "Refresh")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </SettingsCard>
    );
}
