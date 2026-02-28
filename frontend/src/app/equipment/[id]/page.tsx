"use client";

import { useEffect, useState, useCallback, use, Activity } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    History,
    PenLine,
    ChevronLeft,
    AlertTriangle,
    Hash,
    ShieldCheck,
    Clock,
} from "lucide-react";

import { getEquipmentById, getMaintenanceLogs } from "@/lib/api";
import type { Equipment, MaintenanceLog, HealthScore } from "@/lib/types";
import { formatDate, getHealthScore, daysSinceDate } from "@/lib/dateUtils";

import { StatusBadge } from "@/components/equipment/StatusBadge";
import { MaintenanceTimeline } from "@/components/maintenance/MaintenanceTimeline";
import { AddMaintenanceForm } from "@/components/maintenance/AddMaintenanceForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

export default function EquipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const equipmentId = Number(resolvedParams.id);
    const router = useRouter();

    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const eq = await getEquipmentById(equipmentId);
            setEquipment(eq);
            const mLogs = await getMaintenanceLogs(equipmentId);
            setLogs(mLogs);
        } catch (err) {
            setError("Failed to load equipment details.");
        } finally {
            setLoading(false);
        }
    }, [equipmentId]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleMaintenanceAdded = () => {
        fetchDetails(); // re-fetch to update status/health
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-20 w-full rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 rounded-xl" />
                    <Skeleton className="h-64 rounded-xl" />
                </div>
            </div>
        );
    }

    if (!loading && (error || !equipment)) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive opacity-80" />
                <h2 className="text-xl font-semibold text-foreground">Error Loading Asset</h2>
                <p>{error || "This asset could not be found."}</p>
                <Button variant="outline" asChild>
                    <Link href="/">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    if (!equipment) return null;

    const health = getHealthScore(equipment.lastCleanedDate);
    const hConfig = healthConfig[health];
    const days = daysSinceDate(equipment.lastCleanedDate);

    return (
        <div className="space-y-8 max-w-[90rem] mx-auto px-4 md:px-8 py-8 pb-16">
            {/* Back Button */}
            <Button variant="ghost" className="mb-2 -ml-3" asChild>
                <Link href="/" className="flex items-center text-muted-foreground">
                    <ChevronLeft className="mr-1.5 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>

            {/* Unified Hero Card */}
            <div className="section-panel overflow-hidden mb-6">
                <div className="p-8 md:p-10 border-b bg-muted/10">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-semibold tracking-tight mb-2">{equipment.name}</h1>
                            <p className="text-muted-foreground font-medium text-base flex items-center gap-2">
                                {equipment.typeName}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <StatusBadge status={equipment.status} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-t-0 p-6 md:p-8 bg-card/50">
                    {/* Asset ID */}
                    <div className="p-4 flex flex-col justify-center">
                        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold flex items-center gap-2">
                            <Hash className="h-4 w-4" /> Asset ID
                        </p>
                        <p className="text-3xl font-mono tracking-tight font-medium">
                            {equipment.id.toString().padStart(5, '0')}
                        </p>
                    </div>

                    {/* Current Status */}
                    <div className="p-4 flex flex-col justify-center">
                        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold flex items-center gap-2">
                            <Activity children={undefined} /> State
                        </p>
                        <div>
                            <span className="text-2xl font-medium tracking-tight">
                                {equipment.status}
                            </span>
                        </div>
                    </div>

                    {/* Health */}
                    <div className="p-4 flex flex-col justify-center">
                        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold flex justify-between items-center pr-4">
                            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Health Score</span>
                        </p>
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-center justify-between pr-4">
                                <span className={cn("text-lg font-bold tracking-tight", hConfig.colorClass)}>{hConfig.label}</span>
                            </div>
                            <div className="h-2.5 w-full md:w-5/6 overflow-hidden rounded-full bg-muted border">
                                <div className={cn("h-full transition-all", hConfig.barClass, hConfig.width)} />
                            </div>
                        </div>
                    </div>

                    {/* Last Serviced */}
                    <div className="p-4 flex flex-col justify-center">
                        <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Last Serviced
                        </p>
                        <div className="flex flex-col">
                            <span className="text-3xl font-medium tracking-tight">
                                {days} day{days !== 1 ? "s" : ""} ago
                            </span>
                            <span className="text-sm text-muted-foreground mt-1">
                                {formatDate(equipment.lastCleanedDate)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6">

                {/* Log Maintenance Form */}
                <div className="section-panel p-6 md:p-10 border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 overflow-hidden mix-blend-multiply dark:mix-blend-screen pointer-events-none">
                        <PenLine className="h-48 w-48 -mr-12 -mt-12 scale-110" />
                    </div>

                    <div className="mb-8 flex items-center gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-5">
                        <div className="p-2.5 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-xl text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                            <PenLine className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground tracking-tight">Record Maintenance</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Keep accurate logs to maintain GMP compliance.</p>
                        </div>
                    </div>
                    <div className="relative">
                        <AddMaintenanceForm
                            equipmentId={equipment.id}
                            onSuccess={handleMaintenanceAdded}
                        />
                    </div>
                </div>

                {/* Maintenance Timeline */}
                <div className="section-panel p-6 md:p-10 shadow-sm">
                    <div className="flex items-center justify-between mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground tracking-tight">Service History</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">Tracking {logs.length} past record{logs.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pr-2">
                        {logs.length > 0 ? (
                            <MaintenanceTimeline logs={logs} />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/30 border border-dashed rounded-xl">
                                <Activity children={undefined} />
                                <p className="text-sm font-medium">No maintenance history recorded.</p>
                                <p className="text-xs mt-1">Submit a log item using the form to start tracking.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
