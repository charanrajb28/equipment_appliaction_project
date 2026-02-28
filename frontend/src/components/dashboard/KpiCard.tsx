"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    description?: string;
    delay?: string;
    className?: string;
}

export function KpiCard({
    title,
    value,
    icon: Icon,
    description,
    delay = "",
    className
}: KpiCardProps) {
    return (
        <div
            className={cn(
                "section-panel p-5 animate-fade-in opacity-0 transition-colors hover:bg-muted/30",
                delay,
                className
            )}
        >
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">
                    {title}
                </p>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
                <p className="text-3xl font-semibold tracking-tight">
                    {value}
                </p>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
    );
}
