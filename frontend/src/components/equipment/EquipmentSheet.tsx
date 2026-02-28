"use client";

import { useEffect, useState } from "react";
import { getMaintenanceLogs } from "@/lib/api";
import type { Equipment, MaintenanceLog } from "@/lib/types";
import { formatDate, getHealthScore, daysSinceDate } from "@/lib/dateUtils";
import { StatusBadge } from "./StatusBadge";
import { MaintenanceTimeline } from "@/components/maintenance/MaintenanceTimeline";
import { AddMaintenanceForm } from "@/components/maintenance/AddMaintenanceForm";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { HealthScore } from "@/lib/types";

interface EquipmentSheetProps {
    equipment: Equipment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEquipmentUpdated: () => void;
}

const healthConfig: Record<
    HealthScore,
    { label: string; colorClass: string; barClass: string; width: string }
> = {
    Excellent: {
        label: "Excellent",
        colorClass: "text-emerald-600 dark:text-emerald-400",
        barClass: "bg-emerald-500",
        width: "w-full",
    },
    Good: {
        label: "Good",
        colorClass: "text-blue-600 dark:text-blue-400",
        barClass: "bg-blue-500",
        width: "w-3/4",
    },
    Fair: {
        label: "Fair",
        colorClass: "text-amber-600 dark:text-amber-400",
        barClass: "bg-amber-500",
        width: "w-1/2",
    },
    Overdue: {
        label: "Overdue",
        colorClass: "text-red-600 dark:text-red-400",
        barClass: "bg-red-500",
        width: "w-1/4",
    },
};

export function EquipmentSheet({
    equipment,
    open,
    onOpenChange,
    onEquipmentUpdated,
}: EquipmentSheetProps) {
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (equipment && open) {
            setLoading(true);
            getMaintenanceLogs(equipment.id)
                .then(setLogs)
                .catch(() => setLogs([]))
                .finally(() => setLoading(false));
        }
    }, [equipment, open]);

    const handleMaintenanceAdded = () => {
        if (equipment) {
            getMaintenanceLogs(equipment.id).then(setLogs);
        }
        onEquipmentUpdated();
    };

    if (!equipment) return null;

    const health = getHealthScore(equipment.lastCleanedDate);
    const hConfig = healthConfig[health];
    const days = daysSinceDate(equipment.lastCleanedDate);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader className="mb-4">
                    <SheetTitle className="text-lg">{equipment.name}</SheetTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={equipment.status} />
                        <span className="text-sm text-muted-foreground">
                            {equipment.typeName}
                        </span>
                    </div>
                </SheetHeader>

                <Separator className="mb-4" />

                {/* Health Score */}
                <div className="mb-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Maintenance Health</p>
                        <p className={cn("text-sm font-semibold", hConfig.colorClass)}>
                            {hConfig.label}
                        </p>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-sm bg-muted border">
                        <div
                            className={cn("h-full transition-all", hConfig.barClass, hConfig.width)}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Last cleaned {days} day{days !== 1 ? "s" : ""} ago —{" "}
                        {formatDate(equipment.lastCleanedDate)}
                    </p>
                </div>

                <Separator className="mb-4" />

                {/* Tabs: History + Log Maintenance */}
                <Tabs defaultValue="history">
                    <TabsList className="w-full">
                        <TabsTrigger value="history" className="flex-1">
                            History ({logs.length})
                        </TabsTrigger>
                        <TabsTrigger value="log" className="flex-1">
                            Log Maintenance
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="history" className="mt-4">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                                ))}
                            </div>
                        ) : (
                            <MaintenanceTimeline logs={logs} />
                        )}
                    </TabsContent>
                    <TabsContent value="log" className="mt-4">
                        <AddMaintenanceForm
                            equipmentId={equipment.id}
                            onSuccess={handleMaintenanceAdded}
                        />
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
