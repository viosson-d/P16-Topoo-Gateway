
import { Activity, Power, PowerOff, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

interface ProxyStatusCardProps {
    status: {
        last_check: string;
        is_healthy: boolean;
        message: string;
    };
    isChecking: boolean;
    onCheck: () => void;
}

export function ProxyStatusCard({ status, isChecking, onCheck }: ProxyStatusCardProps) {
    const { t } = useTranslation();

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-[13px] font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            {t('proxy.title')}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {t('proxy.config.title')}
                        </CardDescription>
                    </div>
                    <Badge variant={status.is_healthy ? "default" : "destructive"} className={cn("px-2.5 py-0.5", status.is_healthy ? "bg-green-500 hover:bg-green-600" : "")}>
                        {status.is_healthy ? "Healthy" : "Unhealthy"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", status.is_healthy ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400")}>
                            {status.is_healthy ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">{status.message || (status.is_healthy ? t('proxy.status.running') : t('proxy.status.stopped'))}</p>
                            <p className="text-[10px] text-muted-foreground">Last checked: {status.last_check || 'Never'}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCheck} disabled={isChecking} className="h-8 w-8">
                        <RefreshCw className={cn("h-4 w-4", isChecking && "animate-spin")} />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
