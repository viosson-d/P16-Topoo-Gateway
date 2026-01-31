import { Globe } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

interface SystemStatusCardProps {
    className?: string;
}

export function SystemStatusCard({ className }: SystemStatusCardProps) {
    return (
        <Card className={cn("hidden md:flex flex-col shadow-sm border-border/40 overflow-hidden", className)} style={{ fontFamily: "'Geist', sans-serif" }}>
            {/* Outer Title */}
            <div className="flex items-center justify-between px-4 py-3">
                <h2 className="text-[12px] font-medium text-foreground/90 tracking-tight leading-snug">System Nodes</h2>
            </div>

            {/* Content Area */}
            <div className="p-3 bg-zinc-50/50 dark:bg-black/20">
                <Card className="rounded-lg border-border/40 shadow-sm bg-white dark:bg-zinc-900 p-0 overflow-hidden">
                    <div className="p-0">
                        <div className="flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-default">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-border/20">
                                    <Globe className="w-3.5 h-3.5 text-muted-foreground/60" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[12px] font-medium text-foreground/90 leading-snug block">Local Gateway</span>
                                    <span className="text-[10px] text-muted-foreground/40 tabular-nums leading-snug">127.0.0.1:8046</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-emerald-500/80 tabular-nums">Online</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/20" />
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </Card>
    );
}

export default SystemStatusCard;
