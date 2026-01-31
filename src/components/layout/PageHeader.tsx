import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
    sticky?: boolean;
}

export function PageHeader({ title, description, children, className, sticky = true }: PageHeaderProps) {
    return (
        <div className={cn(
            "flex items-start justify-between shrink-0 w-full transition-all relative",
            sticky && "sticky top-0 z-30 pt-8 pb-3 mb-0 bg-background/80 backdrop-blur-md border-b border-transparent",
            !sticky && "pt-0 pb-0 mb-0",
            className
        )}>
            {sticky && (
                <div
                    className="absolute top-0 left-0 w-full h-8 z-10"
                    data-tauri-drag-region
                />
            )}
            <div className="flex flex-col gap-0 select-none relative z-20">
                <h2 className="text-sm font-medium leading-tight tracking-tight text-foreground cursor-default">{title}</h2>
                {description && (
                    <p className="text-[10px] text-muted-foreground/60 cursor-default line-clamp-1">
                        {description}
                    </p>
                )}
            </div>
            {children && <div className="flex items-center gap-2 relative z-20 mt-1">{children}</div>}
        </div>
    );
}
