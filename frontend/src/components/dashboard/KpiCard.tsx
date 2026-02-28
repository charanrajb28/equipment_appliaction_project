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
                "section-panel p-6 md:p-8 animate-fade-in opacity-0 transition-colors hover:bg-muted/30",
                delay,
                className
            )}
        >
            <div className="flex items-start justify-between mb-6">
                <p className="text-sm font-medium text-muted-foreground">
                    {title}
                </p>
                <div className="p-2 bg-muted rounded-xl transition-all">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>
            <div>
                <p className="text-4xl font-semibold tracking-tight">
                    {value}
                </p>
                {description && (
                    <p className="mt-2 text-xs text-muted-foreground/80">{description}</p>
                )}
            </div>
        </div>
    );
}
