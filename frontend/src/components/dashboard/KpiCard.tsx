"use client";

import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    colorClass: string;
    bgClass: string;
    description?: string;
}

export function KpiCard({
    title,
    value,
    icon: Icon,
    colorClass,
    bgClass,
    description,
}: KpiCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold tracking-tight">{value}</p>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                    <div className={cn("rounded-xl p-3", bgClass)}>
                        <Icon className={cn("h-5 w-5", colorClass)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
