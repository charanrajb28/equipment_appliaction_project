"use client";

import { useEffect, useState, useCallback, use, Activity } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
    Excellent: { label: "Excellent", colorClass: "text-emerald-600 dark:text-emerald-400", barClass: "bg-emerald-500", width: "w-full" },
    Good: { label: "Good", colorClass: "text-blue-600 dark:text-blue-400", barClass: "bg-blue-500", width: "w-3/4" },
    Fair: { label: "Fair", colorClass: "text-amber-600 dark:text-amber-400", barClass: "bg-amber-500", width: "w-1/2" },
    Overdue: { label: "Overdue", colorClass: "text-red-600 dark:text-red-400", barClass: "bg-red-500", width: "w-1/4" },
};

export default function EquipmentDetailsPage() {
    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");
    const equipmentId = idParam ? Number(idParam) : null;
    const router = useRouter();

    const [equipment, setEquipment] = useState<Equipment | null>(null);
    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const fetchDetails = useCallback(async () => {
        if (!equipmentId) return;
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
        if (equipmentId) fetchDetails();
        else setLoading(false);
    }, [fetchDetails, equipmentId]);

    const handleMaintenanceAdded = () => { fetchDetails(); };

    if (!equipmentId) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
                <AlertTriangle className="h-12 w-12 text-destructive opacity-80" />
                <h2 className="text-xl font-semibold text-foreground">Invalid Asset ID</h2>
                <Button variant="outline" asChild><Link href="/">Back to Dashboard</Link></Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-6 max-w-[90rem] mx-auto px-4 md:px-8 py-8">
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
                <Button variant="outline" asChild><Link href="/">Back to Dashboard</Link></Button>
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
            <Button variant="ghost" className="mb-2 -ml-3" asChild>
                <Link href="/" className="flex items-center text-muted-foreground"><ChevronLeft className="mr-1.5 h-4 w-4" />Back to Dashboard</Link>
            </Button>
            <div className="section-panel p-8 md:p-10 mb-8 relative overflow-hidden bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800/60">
                <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">{equipment.name}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-medium">
                            <span className="bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">{equipment.typeName}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="flex items-center gap-1.5 font-mono bg-white/60 dark:bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Hash className="h-3.5 w-3.5 opacity-70 text-slate-500" /> {equipment.id.toString().padStart(5, '0')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
