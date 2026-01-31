import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { Loader2, Cloud, Download, Play, Square, ExternalLink, Copy, Check, Hash, ShieldCheck, Zap } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { showToast } from "../common/ToastContainer";
import { cn } from "../../lib/utils";
import { CloudflaredStatus, CloudflaredConfig } from "../../types/config";
import { SettingsCard } from "../settings/SettingsCard";
import { SettingsItem } from "../settings/SettingsItem";

export function CloudflaredConfigCard() {
    const { t } = useTranslation();
    const [status, setStatus] = useState<CloudflaredStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<CloudflaredConfig>({
        enabled: false,
        mode: 'quick',
        port: 8045, // Default port, should sync with proxy port
        use_http2: true,
        token: ''
    });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const res = await invoke<CloudflaredStatus>('cloudflared_get_status');
            setStatus(res);
            if (res.running) {
                setConfig(prev => ({ ...prev, enabled: true }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleInstall = async () => {
        setLoading(true);
        try {
            await invoke('cloudflared_install');
            showToast(t('proxy.cloudflared.install_success'), 'success');
            checkStatus();
        } catch (error) {
            showToast(t('proxy.cloudflared.install_failed', { error }), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async () => {
        setLoading(true);
        try {
            if (status?.running) {
                await invoke('cloudflared_stop');
                showToast(t('proxy.cloudflared.stopped'), 'success');
            } else {
                await invoke('cloudflared_start', { config });
                showToast(t('proxy.cloudflared.started'), 'success');
            }
            await checkStatus();
        } catch (error) {
            const msg = status?.running ? t('proxy.cloudflared.stop_failed', { error }) : t('proxy.cloudflared.start_failed', { error });
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const copyUrl = () => {
        if (status?.url) {
            navigator.clipboard.writeText(status.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            showToast(t('proxy.cloudflared.url_copied'), 'success');
        }
    };

    if (!status) return null;

    return (
        <SettingsCard
            title={t('proxy.cloudflared.title')}
            description={t('proxy.cloudflared.subtitle')}
            headerExtra={status.installed && (
                <Badge variant={status.running ? "default" : "secondary"} className={cn("text-[10px] px-2 h-5", status.running && "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20 shadow-sm")}>
                    {status.running ? t('proxy.cloudflared.status_running') : t('proxy.cloudflared.status_stopped')}
                </Badge>
            )}
        >
            {!status.installed ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center bg-orange-50/20 dark:bg-orange-950/5 w-full">
                    <div className="p-4 bg-orange-50 rounded-full dark:bg-orange-900/20">
                        <Cloud className="h-8 w-8 text-orange-500" />
                    </div>
                    <div className="space-y-1 max-w-[280px]">
                        <h3 className="font-medium text-sm text-foreground">{t('proxy.cloudflared.not_installed')}</h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed break-words">{t('proxy.cloudflared.install_hint')}</p>
                    </div>
                    <Button onClick={handleInstall} disabled={loading} size="sm" className="bg-orange-500 hover:bg-orange-600 h-7 px-4 text-[11px] font-medium leading-tight shadow-md shadow-orange-500/10">
                        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Download className="h-3 w-3 mr-2" />}
                        {t('proxy.cloudflared.install')}
                    </Button>
                </div>
            ) : (
                <div className="divide-y divide-border/20">
                    {/* Tunnel URL - Professional Display */}
                    {status.running && status.url && (
                        <div className="px-3 py-2.5 bg-green-50/40 dark:bg-green-950/10 border-b border-green-100 dark:border-green-900/20 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <Zap className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-green-600 dark:text-green-400 font-bold leading-tight">{t('proxy.cloudflared.public_url')}</p>
                                    <a href={status.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-mono truncate hover:underline flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                                        {status.url}
                                        <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30" onClick={copyUrl}>
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                        </div>
                    )}

                    {/* Mode Selection */}
                    <SettingsItem
                        icon={ShieldCheck}
                        title={t('proxy.cloudflared.mode_label')}
                        description="Quick Tunnel for testing or Auth Tunnel for production"
                    >
                        <div className="flex bg-muted/30 p-0.5 rounded-lg border border-border/20">
                            <Button
                                variant={config.mode === 'quick' ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setConfig(c => ({ ...c, mode: 'quick' }))}
                                disabled={status.running}
                                className={cn("h-7 px-4 text-[10px] font-bold rounded-md transition-all", config.mode === 'quick' && "bg-white dark:bg-muted/40 shadow-sm")}
                            >
                                {t('proxy.cloudflared.mode_quick')}
                            </Button>
                            <Button
                                variant={config.mode === 'auth' ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setConfig(c => ({ ...c, mode: 'auth' }))}
                                disabled={status.running}
                                className={cn("h-7 px-4 text-[10px] font-bold rounded-md transition-all", config.mode === 'auth' && "bg-white dark:bg-muted/40 shadow-sm")}
                            >
                                {t('proxy.cloudflared.mode_auth')}
                            </Button>
                        </div>
                    </SettingsItem>

                    {/* Port */}
                    <SettingsItem
                        icon={Hash}
                        title={t('proxy.cloudflared.local_port')}
                        description="Local port to expose through the tunnel"
                    >
                        <Input
                            type="number"
                            value={config.port}
                            onChange={e => setConfig(c => ({ ...c, port: parseInt(e.target.value) }))}
                            disabled={status.running}
                            className="w-24 h-8 text-[11px] bg-muted/20 text-center font-bold"
                        />
                    </SettingsItem>

                    {/* Token (Auth only) */}
                    {config.mode === 'auth' && (
                        <SettingsItem
                            title={t('proxy.cloudflared.token')}
                            description={t('proxy.cloudflared.token_hint')}
                        >
                            <Input
                                type="password"
                                value={config.token || ''}
                                onChange={e => setConfig(c => ({ ...c, token: e.target.value }))}
                                placeholder={t('proxy.cloudflared.token_placeholder')}
                                disabled={status.running}
                                className="w-[280px] h-8 font-mono text-[10px] bg-muted/20"
                            />
                        </SettingsItem>
                    )}

                    {/* HTTP/2 Toggle */}
                    <SettingsItem
                        title={t('proxy.cloudflared.use_http2')}
                        description={t('proxy.cloudflared.use_http2_desc')}
                    >
                        <Switch
                            size="sm"
                            checked={config.use_http2}
                            onCheckedChange={v => setConfig(c => ({ ...c, use_http2: v }))}
                            disabled={status.running}
                        />
                    </SettingsItem>

                    {/* Service Control */}
                    <SettingsItem
                        icon={status.running ? Square : Play}
                        title={t('proxy.cloudflared.service_control')}
                        description={status.running ? t('proxy.cloudflared.service_running_desc', 'Tunnel is active and routing traffic') : t('proxy.cloudflared.service_stopped_desc', 'Start the tunnel to expose local service')}
                    >
                        <Button
                            className={cn(
                                "h-7 px-4 text-[10px] font-bold shadow-sm transition-all",
                                status.running ? "bg-red-500 hover:bg-red-600 shadow-red-500/10" : "bg-primary hover:bg-primary/90 shadow-primary/10"
                            )}
                            onClick={handleToggle}
                            disabled={loading}
                            size="sm"
                        >
                            {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                            {status.running ? t('proxy.cloudflared.stop_tunnel') : t('proxy.cloudflared.start_tunnel')}
                        </Button>
                    </SettingsItem>
                </div>
            )}
        </SettingsCard>
    );
}
