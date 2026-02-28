"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  CheckCircle2,
  Wrench,
  AlertTriangle,
} from "lucide-react";

import type { Equipment, EquipmentType, MaintenanceLog } from "@/lib/types";
import { getEquipment, getEquipmentTypes, getMaintenanceLogs } from "@/lib/api";
import { isOverdue } from "@/lib/dateUtils";

import { KpiCard } from "@/components/dashboard/KpiCard";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { OverdueAlert } from "@/components/dashboard/OverdueAlert";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { EquipmentTable } from "@/components/equipment/EquipmentTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [allLogs, setAllLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [equipList, typeList] = await Promise.all([
        getEquipment(),
        getEquipmentTypes(),
      ]);
      setEquipment(equipList);
      setTypes(typeList);

      // Fetch maintenance logs for all equipment in parallel
      const logResults = await Promise.allSettled(
        equipList.map((e) => getMaintenanceLogs(e.id))
      );
      const logs = logResults.flatMap((r) =>
        r.status === "fulfilled" ? r.value : []
      );
      setAllLogs(logs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // KPI derived values
  const totalCount = equipment.length;
  const activeCount = equipment.filter((e) => e.status === "Active").length;
  const maintenanceCount = equipment.filter(
    (e) => e.status === "Under Maintenance"
  ).length;
  const overdueCount = equipment.filter((e) => isOverdue(e.lastCleanedDate)).length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your equipment fleet and maintenance health
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">
            Could not connect to backend: {error}. Make sure your Spring Boot server is running on{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}
            </code>
          </p>
        </div>
      )}

      {/* Overdue alert */}
      {!loading && equipment.length > 0 && (
        <OverdueAlert equipment={equipment} />
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Equipment"
            value={totalCount}
            icon={Package}
            colorClass="text-sky-600 dark:text-sky-400"
            bgClass="bg-sky-100 dark:bg-sky-950/40"
            description="All registered items"
          />
          <KpiCard
            title="Active"
            value={activeCount}
            icon={CheckCircle2}
            colorClass="text-emerald-600 dark:text-emerald-400"
            bgClass="bg-emerald-100 dark:bg-emerald-950/40"
            description="Currently operational"
          />
          <KpiCard
            title="Under Maintenance"
            value={maintenanceCount}
            icon={Wrench}
            colorClass="text-amber-600 dark:text-amber-400"
            bgClass="bg-amber-100 dark:bg-amber-950/40"
            description="Being serviced"
          />
          <KpiCard
            title="Overdue"
            value={overdueCount}
            icon={AlertTriangle}
            colorClass="text-red-600 dark:text-red-400"
            bgClass="bg-red-100 dark:bg-red-950/40"
            description="Last cleaned >30 days"
          />
        </div>
      )}

      <Separator />

      {/* Main content: table + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <EquipmentTable
            equipment={equipment}
            types={types}
            loading={loading}
            onRefresh={fetchAll}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <StatusChart equipment={equipment} />
          <ActivityFeed logs={allLogs} equipment={equipment} />
        </div>
      </div>
    </div>
  );
}
