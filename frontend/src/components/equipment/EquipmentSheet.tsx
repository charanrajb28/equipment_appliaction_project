"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Hash, Clock, ShieldCheck, Activity, History, PenLine } from "lucide-react";
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
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6 mt-2">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-foreground">
                            <FlaskConical className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 text-left">
                            <SheetTitle className="text-xl tracking-tight leading-none">{equipment.name}</SheetTitle>
                            <p className="text-sm text-muted-foreground">
                                {equipment.typeName}
                            </p>
                        </div>
                    </div>
                </SheetHeader>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="rounded-xl border bg-card p-3 shadow-sm flex flex-col justify-center items-start">
                        <span className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5" /> Current Status
                        </span>
                        <StatusBadge status={equipment.status} />
                    </div>
                    <div className="rounded-xl border bg-card p-3 shadow-sm flex flex-col justify-center">
                        <span className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                            <Hash className="h-3.5 w-3.5" /> Asset ID
                        </span>
                        <span className="text-sm font-semibold font-mono tracking-tight">
                            {equipment.id.toString().padStart(5, '0')}
                        </span>
                    </div>
                </div>

                {/* Health Score */}
                <div className="mb-6 rounded-xl border bg-slate-50/50 dark:bg-slate-900/20 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-semibold">Maintenance Health</p>
                        </div>
                        <p className={cn("text-xs font-bold uppercase tracking-wider", hConfig.colorClass)}>
                            {hConfig.label}
                        </p>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted border mb-3">
                        <div
                            className={cn("h-full transition-all", hConfig.barClass, hConfig.width)}
                        />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>Last cleaned <strong>{days} day{days !== 1 ? "s" : ""} ago</strong> ({formatDate(equipment.lastCleanedDate)})</span>
                    </div>
                </div>

                {/* Tabs: History + Log Maintenance */}
                <Tabs defaultValue="history">
                    <TabsList className="w-full rounded-full">
                        <TabsTrigger value="history" className="flex-1 rounded-full gap-2">
                            <History className="h-3.5 w-3.5" /> History ({logs.length})
                        </TabsTrigger>
                        <TabsTrigger value="log" className="flex-1 rounded-full gap-2">
                            <PenLine className="h-3.5 w-3.5" /> Log Maintenance
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
