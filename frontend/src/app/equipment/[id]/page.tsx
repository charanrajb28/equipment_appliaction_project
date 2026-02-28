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
    Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";

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
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

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

    const filteredLogs = logs.filter(log => {
        if (startDate && new Date(log.maintenanceDate) < new Date(startDate)) return false;
        if (endDate && new Date(log.maintenanceDate) > new Date(endDate)) return false;
        return true;
    });

    return (
        <div className="space-y-8 max-w-[90rem] mx-auto px-4 md:px-8 py-8 pb-16">
            {/* Back Button */}
            <Button variant="ghost" className="mb-2 -ml-3" asChild>
                <Link href="/" className="flex items-center text-muted-foreground">
                    <ChevronLeft className="mr-1.5 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>

            {/* Unified Premium Hero Card */}
            <div className="section-panel p-8 md:p-10 mb-8 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/60">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-96 h-96" />
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                    {/* Left: Identity & Metadata */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                            {equipment.name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
                            <span className="bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                {equipment.typeName}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="flex items-center gap-1.5 font-mono bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Hash className="h-3.5 w-3.5 opacity-70 text-slate-500" /> {equipment.id.toString().padStart(5, '0')}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>
                            <span className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Clock className="h-3.5 w-3.5 opacity-70 text-slate-500" />
                                Last Serviced: {days} day{days !== 1 ? "s" : ""} ago
                                <span className="opacity-60 font-normal hidden lg:inline">({formatDate(equipment.lastCleanedDate)})</span>
                            </span>
                        </div>
                    </div>

                    {/* Right: Status & Health Bar */}
                    <div className="flex flex-col items-start md:items-end gap-4 md:min-w-[320px] shrink-0">
                        <div className="scale-110 origin-left md:origin-right">
                            <StatusBadge status={equipment.status} />
                        </div>

                        <div className="w-full bg-white/80 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 shadow-sm p-4 rounded-2xl flex flex-col gap-2.5 mt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <ShieldCheck className="h-3.5 w-3.5" /> Health Score
                                </span>
                                <span className={cn("text-xs font-bold tracking-wide", hConfig.colorClass)}>
                                    {hConfig.label}
                                </span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted border border-black/5 dark:border-white/5">
                                <div className={cn("h-full transition-all", hConfig.barClass, hConfig.width)} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6 items-start">

                {/* Log Maintenance Form */}
                <div className="section-panel p-6 md:p-10 border-emerald-100/80 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-emerald-600/5 dark:text-emerald-400/5 overflow-hidden mix-blend-multiply dark:mix-blend-screen pointer-events-none">
                        <PenLine className="h-48 w-48 -mr-12 -mt-12 scale-110" />
                    </div>

                    <div className="mb-8 flex items-center gap-3 border-b border-emerald-100 dark:border-emerald-900/30 pb-5">
                        <div className="p-2.5 bg-emerald-100/50 dark:bg-emerald-900/40 rounded-xl text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
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
                <div className="section-panel p-6 md:p-10 shadow-sm bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-100/60 dark:border-indigo-900/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-indigo-100 dark:border-indigo-900/30 pb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-100/50 dark:bg-indigo-900/40 rounded-xl text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                                <History className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground tracking-tight">Service History</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 whitespace-nowrap">Tracking {filteredLogs.length} past record{filteredLogs.length !== 1 ? "s" : ""}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="pl-8 h-8 text-xs bg-background/50"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    title="Start Date"
                                />
                            </div>
                            <span className="text-muted-foreground text-xs">-</span>
                            <div className="relative">
                                <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    className="pl-8 h-8 text-xs bg-background/50"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    title="End Date"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pr-2">
                        {filteredLogs.length > 0 ? (
                            <MaintenanceTimeline logs={filteredLogs} />
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
