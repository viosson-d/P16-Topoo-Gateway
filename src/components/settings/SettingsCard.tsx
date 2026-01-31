import React from 'react';
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    headerExtra?: React.ReactNode;
}

export function SettingsCard({ title, description, children, className, headerExtra }: SettingsCardProps) {
    return (
        <Card className={cn(
            "border-none shadow-none bg-transparent group min-w-0",
            className
        )}>
            <CardHeader className="px-0 pt-0 pb-3 flex flex-row items-center justify-between space-y-0 min-w-0">
                <div className="flex flex-col gap-0.5 min-w-0 flex-1 mr-4">
                    <div className="text-[12px] font-medium text-foreground group-hover:text-foreground transition-colors force-no-transform normal-case truncate leading-snug">{title}</div>
                    {description && (
                        <CardDescription className="text-[11px] leading-snug text-muted-foreground/70 font-normal truncate">
                            {description}
                        </CardDescription>
                    )}
                </div>
                {headerExtra}
            </CardHeader>
            <CardContent className="p-0 bg-white dark:bg-muted/5 rounded-lg border border-border/40 overflow-hidden shadow-sm">
                <div className="flex flex-col">
                    {children}
                </div>
            </CardContent>
        </Card>
    );
}
