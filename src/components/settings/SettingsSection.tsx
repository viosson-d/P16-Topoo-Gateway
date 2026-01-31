import React from 'react';

interface SettingsSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: SettingsSectionProps) {
    return (
        <div className="space-y-8 pb-10">
            <div className="space-y-1.5 pb-2 border-b border-border/40">
                <h1 className="text-2xl font-bold tracking-tight text-foreground !normal-case">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                        {description}
                    </p>
                )}
            </div>

            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}
