

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { RefreshCw, ExternalLink, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { ProxyConfig, AppConfig } from '../types/config';
import { useConfigStore } from '../stores/useConfigStore';
import { cn } from '../lib/utils';
import { showToast } from '../components/common/ToastContainer';
import { UpstreamProxyConfig } from '../components/proxy/UpstreamProxyConfig';
import { ModelMapping } from '../components/proxy/ModelMapping';
import { CloudflaredConfigCard } from '../components/proxy/CloudflaredConfig';
import { GeneralSettings } from '../components/proxy/GeneralSettings';
import { AdvancedSettings } from '../components/proxy/AdvancedSettings';
import { ZaiConfigCard } from '../components/proxy/ZaiConfig';
import { SchedulingConfigCard } from '../components/proxy/SchedulingConfig';
import { CliSyncSection } from '../components/proxy/CliSyncSection';
import { useAccountStore } from '../stores/useAccountStore';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';

const DEFAULT_APP_CONFIG: AppConfig = {
    language: 'zh',
    theme: 'system',
    auto_refresh: false,
    refresh_interval: 30,
    auto_sync: false,
    sync_interval: 60,
    scheduled_warmup: { enabled: false, monitored_models: [] },
    quota_protection: { enabled: false, threshold_percentage: 5, monitored_models: [] },
    pinned_quota_models: { models: [] },
    proxy: {
        enabled: false,
        port: 8045,
        api_key: '',
        upstream_proxy: { enabled: false, url: '' },
        custom_mapping: {},
        enable_logging: true,
        request_timeout: 60,
        auto_start: false,
        allow_lan_access: false,
        auth_mode: 'off',
        zai: {
            enabled: false,
            base_url: 'https://api.z.ai/api/anthropic',
            api_key: '',
            dispatch_mode: 'off',
            models: { opus: '', sonnet: '', haiku: '' },
            mcp: { enabled: false, web_search_enabled: false, web_reader_enabled: false, vision_enabled: false }
        },
        scheduling: { mode: 'Balance', max_wait_seconds: 5 }
    }
};



interface ProxyStatus {
    running: boolean;
    port: number;
    base_url: string;
    active_accounts: number;
    last_check?: string;
    message?: string;
}

export default function ApiProxy() {
    const { t } = useTranslation();
    const { config, saveConfig } = useConfigStore();

    // Derived state from store to ensure source of truth is always the store
    const proxyConfig = config?.proxy || DEFAULT_APP_CONFIG.proxy;

    const [status, setStatus] = useState<ProxyStatus>({
        running: false,
        port: 8045,
        base_url: 'http://localhost:8045',
        active_accounts: 0,
        last_check: '',
        message: ''
    });

    const { accounts, refreshAllQuotas: refreshAccounts } = useAccountStore();
    const [isChecking, setIsChecking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [errorCount, setErrorCount] = useState(0);

    const hasAccounts = accounts.length > 0;

    useEffect(() => {
        // Initial load via store if not already loaded
        if (!config) {
            useConfigStore.getState().loadConfig();
        }
        checkStatus();
        refreshAccounts();
        const interval = setInterval(checkStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        setIsChecking(true);
        try {
            const currentStatus = await invoke<ProxyStatus>('get_proxy_status');
            setStatus(currentStatus);
            if (!currentStatus.running && currentStatus.message?.toLowerCase().includes('already in use')) {
                setErrorCount(prev => prev + 1);
            } else {
                setErrorCount(0);
            }
        } catch (error) { }
        finally { setIsChecking(false); }
    };

    const handleSave = useCallback(async (key: keyof ProxyConfig, value: any) => {
        // Use store's state or fallback to default if store is empty
        const currentConfig = useConfigStore.getState().config || DEFAULT_APP_CONFIG;

        const updatedProxy = {
            ...currentConfig.proxy,
            [key]: value
        };

        const updatedConfig = {
            ...currentConfig,
            proxy: updatedProxy
        };

        try {
            // Optimistic Update: Push to global store immediately
            useConfigStore.getState().setConfig(updatedConfig);

            // Backend Persistence
            await saveConfig(updatedConfig);

            showToast(t('common.saved'), 'success');
        } catch (error) {
            console.error('Failed to save configuration:', error);
            // Show more detailed error to user
            const errorMsg = error instanceof Error ? error.message : String(error);
            showToast(t('common.save_failed') + errorMsg, 'error');

            // TEMPORARY FIX: Do NOT revert state so user can verify UI interaction works
            // useConfigStore.getState().setConfig(currentConfig);
        }
    }, [config, t]);

    const toggleProxy = async () => {
        if (!config) return;

        if (!status.running && !hasAccounts) {
            showToast(t('accounts.no_accounts_warning', 'No accounts found. Please add an account first.'), 'warning');
            return;
        }

        setIsLoading(true);
        try {
            if (status.running) {
                await invoke('stop_proxy_service');
                showToast(t('proxy.action.stop'), 'success');
            } else {
                await invoke('start_proxy_service', { config: proxyConfig });
                showToast(t('proxy.action.start'), 'success');
            }
            await checkStatus();
        } catch (err: any) {
            showToast(`Error: ${err}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForceCleanup = async () => {
        setIsCleaning(true);
        try {
            const result = await invoke('force_cleanup_ports');
            showToast(result as string, 'success');
            await checkStatus();
        } catch (err) {
            showToast('Failed to cleanup ports: ' + err, 'error');
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <PageContainer className="p-0">
            <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
                <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-8 pt-8 pb-2 space-y-4 shrink-0">
                    <PageHeader
                        sticky={false}
                        title={t('nav.api_proxy', 'API Proxy')}
                        description={t('proxy.page_desc')}
                    >
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/30">
                            <div className={cn(
                                "h-2 w-2 rounded-full",
                                status.running ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-yellow-500"
                            )} />
                            <span className="text-xs font-medium text-muted-foreground/80 lowercase">
                                {status.running ? t('proxy.status.running') : t('proxy.status.stopped')}
                            </span>
                        </div>

                        <Button
                            variant={status.running ? "destructive" : "default"}
                            onClick={toggleProxy}
                            disabled={isLoading || isChecking}
                            size="sm"
                            className="h-7 shadow-sm font-medium px-3 text-[11px]"
                        >
                            {isLoading && <RefreshCw className="w-3 h-3 animate-spin mr-1.5" />}
                            {status.running ? t('proxy.action.stop') : t('proxy.action.start')}
                        </Button>
                    </PageHeader>

                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">{t('proxy.tabs.general', 'General')}</TabsTrigger>
                        <TabsTrigger value="routing">{t('proxy.tabs.routing', 'Routing')}</TabsTrigger>
                        <TabsTrigger value="external">{t('proxy.tabs.external', 'Connect')}</TabsTrigger>
                        <TabsTrigger value="system">{t('proxy.tabs.system', 'System')}</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8 pt-4">
                    <TabsContent value="general" className="space-y-8 mt-0 outline-none">
                        <div className="space-y-3">
                            <h3 className="px-1 text-[12px] font-medium text-muted-foreground/50 tracking-wider">
                                {t('proxy.config.title', 'Service Configuration')}
                            </h3>
                            <GeneralSettings config={proxyConfig} onChange={handleSave} disabled={false} />
                            <AdvancedSettings config={proxyConfig} onChange={handleSave} disabled={false} />
                        </div>
                    </TabsContent>

                    <TabsContent value="routing" className="space-y-6 mt-0 outline-none">
                        <div className="space-y-3">
                            <h3 className="px-1 text-[12px] font-medium text-muted-foreground/50 tracking-wider">
                                {t('proxy.config.zai.model_router_title', 'Model Routing / Mappings')}
                            </h3>
                            <ModelMapping
                                mappings={proxyConfig.custom_mapping || {}}
                                onAdd={(from, to) => handleSave('custom_mapping', { ...proxyConfig.custom_mapping, [from]: to })}
                                onRemove={(from) => {
                                    const newMapping = { ...(proxyConfig.custom_mapping || {}) };
                                    delete newMapping[from];
                                    handleSave('custom_mapping', newMapping);
                                }}
                            />
                        </div>
                        <div className="space-y-3">
                            <h3 className="px-1 text-[12px] font-medium text-muted-foreground/50 tracking-wider">
                                {t('proxy.config.scheduling.title', 'Load Balancing & Scheduling')}
                            </h3>
                            {proxyConfig.scheduling && (
                                <SchedulingConfigCard
                                    config={proxyConfig.scheduling}
                                    onChange={(newSched) => handleSave('scheduling', newSched)}
                                    disabled={false}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="external" className="space-y-6 mt-0 outline-none">
                        <div className="space-y-3">
                            <h3 className="px-1 text-[12px] font-medium text-muted-foreground/50 tracking-wider">
                                {t('proxy.config.zai.external_providers', 'Advanced Features & Providers')}
                            </h3>
                            <div className="grid gap-6">
                                {proxyConfig.zai && <ZaiConfigCard config={proxyConfig.zai} onChange={(newZai) => handleSave('zai', newZai)} disabled={false} />}
                                <CloudflaredConfigCard />
                                <UpstreamProxyConfig
                                    config={proxyConfig.upstream_proxy}
                                    onChange={(key, val) => handleSave('upstream_proxy', { ...proxyConfig.upstream_proxy, [key]: val })}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="system" className="space-y-6 mt-0 outline-none">
                        <div className="space-y-3">
                            <h3 className="px-1 text-[12px] font-medium text-muted-foreground/50 tracking-wider">
                                {t('proxy.config.cli_sync.title', 'Infrastructure Synchronization')}
                            </h3>
                            <CliSyncSection />
                        </div>

                        <Card className={cn("transition-all duration-300", errorCount > 0 && !status.running ? "bg-red-500/5 border-red-200" : "bg-blue-500/5 border-blue-500/10")}>
                            <CardContent className="p-4 px-5">
                                <div className="flex items-start gap-4">
                                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", errorCount > 0 && !status.running ? "bg-red-500/10" : "bg-blue-500/10")}>
                                        {errorCount > 0 && !status.running ? <AlertCircle className="h-3.5 w-3.5 text-red-500 animate-pulse" strokeWidth={1.5} /> : <RefreshCw className="h-3.5 w-3.5 text-blue-500" strokeWidth={1.5} />}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[12px] font-medium leading-none">{errorCount > 0 && !status.running ? t('proxy.port_conflict_title') : t('proxy.status.interactive_docs_title')}</h3>
                                        <p className="text-[11px] text-muted-foreground/70 mt-1 max-w-[320px] leading-relaxed font-normal">
                                            {errorCount > 0 && !status.running ? t('proxy.port_conflict_desc') : t('proxy.status.interactive_docs_desc')}
                                        </p>
                                        {errorCount > 0 && !status.running && (
                                            <Button variant="destructive" size="sm" className="h-7 text-[11px] mt-2 font-medium px-4" onClick={handleForceCleanup} disabled={isCleaning}>
                                                {isCleaning ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <ShieldAlert className="h-3 w-3 mr-2" />}
                                            </Button>
                                        )}
                                        {status.running && (
                                            <a href={`http://localhost:${status.port}/docs`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-500 text-[11px] font-medium mt-2 hover:underline">
                                                {t('proxy.status.view_docs_btn')} <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </div>
            </Tabs>
        </PageContainer>
    );
}
