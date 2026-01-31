import React from 'react';
import { cn } from "@/lib/utils";
import {
    Settings,
    User,
    Globe,
    Shield,
    Info,
    LayoutDashboard
} from "lucide-react";

interface SettingsLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: any) => void;
}

const SIDEBAR_ITEMS = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'account', label: 'Account', icon: User },
    { id: 'proxy', label: 'Proxy', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Shield },
    { id: 'about', label: 'About', icon: Info },
];

export function SettingsLayout({ children, activeTab, onTabChange }: SettingsLayoutProps) {
    return (
        <div className="flex h-full min-h-[600px] w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Sidebar */}
            <aside className="w-[240px] border-r bg-muted/30 flex flex-col pt-6 pb-4 shrink-0">
                <div className="px-6 mb-8">
                    <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-primary" />
                        Settings
                    </h2>
                </div>

                <nav className="flex-1 px-3 space-y-1">
                    {SIDEBAR_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-white dark:bg-zinc-800 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="px-6 mt-auto">
                    <p className="text-[10px] text-muted-foreground/50 font-mono">
                        v3.3.49
                    </p>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="h-full max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
