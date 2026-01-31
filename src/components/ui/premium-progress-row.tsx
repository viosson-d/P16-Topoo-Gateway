import * as React from "react";
import { cn } from "../../lib/utils";

interface PremiumProgressRowProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * The percentage value (0-100)
     */
    value: number;
    /**
     * The label text or element to display on the left
     */
    label?: React.ReactNode;
    /**
     * The value text or element to display on the right (defaults to percentage%)
     */
    valueLabel?: React.ReactNode;
    /**
     * Optional custom content to render in the center or instead of default labels
     */
    children?: React.ReactNode;
    /**
     * Override standard bar color (default is bg-secondary)
     */
    barColor?: string;
}

/**
 * A standardized progress row component pattern for the Topoo UI library.
 * Features:
 * - "Native, Detailed, Crisp" aesthetic
 * - Transparent track with ultra-subtle hover interaction (0.5% opacity)
 * - Standardized 10% minimum width for 0% states
 * - Smooth CSS transitions
 */
export function PremiumProgressRow({
    value,
    label,
    valueLabel,
    children,
    className,
    barColor,
    ...props
}: PremiumProgressRowProps) {
    // 1. Min-width logic to prevent invisible blocks (10%)
    const barWidth = Math.max(value, 10);

    return (
        <div
            className={cn(
                "relative group flex items-center justify-between px-3 py-1.5 rounded-sm overflow-hidden",
                "transition-all hover:bg-zinc-500/[0.005] dark:hover:bg-white/[0.005]",
                className
            )}
            {...props}
        >
            {/* 2. Background Track: Transparent by default, subtle interaction on hover */}
            <div className="absolute left-0 right-0 top-0 bottom-0 bg-transparent group-hover:bg-zinc-500/[0.005] dark:group-hover:bg-white/[0.005] transition-colors" />

            {/* 3. Progress Bar: Secondary color, smooth transition */}
            <div
                className={cn(
                    "absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-in-out",
                    "rounded-sm",
                    barColor || "bg-secondary"
                )}
                style={{ width: `${barWidth}%` }}
            />

            {/* 4. Content Overlay */}
            <div className="relative z-10 flex items-center justify-between w-full">
                {children ? (
                    children
                ) : (
                    <>
                        {label && (
                            <span className={cn(
                                "text-[11px] font-medium truncate pr-2 transition-colors",
                                "text-foreground/80 group-hover:text-foreground"
                            )}>
                                {label}
                            </span>
                        )}
                        <span className={cn(
                            "text-[10px] font-bold tabular-nums transition-colors",
                            "text-foreground/60 group-hover:text-foreground/90"
                        )}>
                            {valueLabel ?? `${value}%`}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
