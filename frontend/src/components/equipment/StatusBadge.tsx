"use client";

import { Badge } from "@/components/ui/badge";
import type { EquipmentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: EquipmentStatus;
    className?: string;
}

const statusConfig: Record<
    EquipmentStatus,
    { label: string; badgeClass: string; dotClass: string }
> = {
    Active: {
        label: "Active",
        badgeClass: "bg-background text-foreground border-border hover:bg-muted",
        dotClass: "bg-green-500",
    },
    Inactive: {
        label: "Inactive",
        badgeClass: "bg-muted text-muted-foreground border-transparent hover:bg-muted/80",
        dotClass: "bg-zinc-400",
    },
    "Under Maintenance": {
        label: "Maintenance",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        dotClass: "bg-amber-500",
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];
    return (
        <Badge
            variant="outline"
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm font-medium shadow-none text-xs",
                config.badgeClass,
                className
            )}
        >
            <span
                className={cn(
                    "inline-flex h-1.5 w-1.5 rounded-sm",
                    config.dotClass
                )}
            />
            {config.label}
        </Badge>
    );
}
