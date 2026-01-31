import React from 'react';
import { cn } from "@/lib/utils";
import { LucideIcon } from 'lucide-react';

interface SettingsItemProps {
    icon?: LucideIcon;
    title: string;
    description?: string | React.ReactNode;
    children: React.ReactNode;
    className?: string;
    vertical?: boolean;
}

export function SettingsItem({ icon: Icon, title, description, children, className, vertical = false }: SettingsItemProps) {
    return (
        <div className={cn(
            "group flex py-2.5 px-3 bg-white dark:bg-muted/5 transition-all duration-200 border-b border-border/5 last:border-none",
            vertical ? "flex-col items-start gap-4" : "flex-row items-center justify-between",
            "hover:bg-zinc-50/50 dark:hover:bg-muted/10",
            className
        )}>
            <div className={cn(
                "flex items-center gap-3 overflow-hidden min-w-0",
                !vertical && "flex-1 mr-4"
            )}>
                {Icon && (
                    <div className="flex-shrink-0 text-foreground/60">
                        <Icon className="w-3.5 h-3.5 stroke-[1.5]" />
                    </div>
                )}

                <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="text-[12px] font-medium text-foreground block truncate normal-case">
                        {title}
                    </div>
                    {description && (
                        <div className="text-[11px] text-muted-foreground/70 leading-normal font-normal">
                            {description}
                        </div>
                    )}
                </div>
            </div>

            <div className={cn(
                "flex items-center shrink-0 min-w-0",
                vertical ? "w-full pt-1" : "gap-2"
            )}>
                {children}
            </div>
        </div>
    );
}
