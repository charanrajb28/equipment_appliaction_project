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
    { label: string; className: string }
> = {
    Active: {
        label: "Active",
        className:
            "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    Inactive: {
        label: "Inactive",
        className:
            "bg-slate-100 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
    },
    "Under Maintenance": {
        label: "Under Maintenance",
        className:
            "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400",
    },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status];
    return (
        <Badge
            variant="secondary"
            className={cn("font-medium", config.className, className)}
        >
            {config.label}
        </Badge>
    );
}
