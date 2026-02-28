"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Layers,
  CheckCircle,
  Wrench,
  AlertTriangle,
  RefreshCw,
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
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [types, setTypes] = useState<EquipmentType[]>([]);
  const [allLogs, setAllLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [equipList, typeList] = await Promise.all([
        getEquipment(),
        getEquipmentTypes(),
      ]);
      setEquipment(equipList);
      setTypes(typeList);

      const logResults = await Promise.allSettled(
        equipList.map((e) => getMaintenanceLogs(e.id))
      );
      const logs = logResults.flatMap((r) =>
        r.status === "fulfilled" ? r.value : []
      );
      setAllLogs(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalCount = equipment.length;
  const activeCount = equipment.filter((e) => e.status === "Active").length;
  const maintenanceCount = equipment.filter((e) => e.status === "Under Maintenance").length;
  const overdueCount = equipment.filter((e) => isOverdue(e.lastCleanedDate)).length;

  const kpiCards = [
    {
      title: "Lab & Mfg Assets",
      value: totalCount,
      icon: Layers,
      description: "Across all categories",
      delay: "delay-75",
    },
    {
      title: "Active",
      value: activeCount,
      icon: CheckCircle,
      description: "Operational units",
      delay: "delay-150",
    },
    {
      title: "In Maintenance",
      value: maintenanceCount,
      icon: Wrench,
      description: "Currently offline",
      delay: "delay-225",
    },
    {
      title: "Overdue",
      value: overdueCount,
      icon: AlertTriangle,
      description: "Requires attention",
      delay: "delay-300",
      className: overdueCount > 0 ? "border-t-2 border-t-red-500/50" : "",
    },
  ];

  return (
    <div className="space-y-8 md:space-y-12 pb-12">
      {/* ── Toolbar Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6 border-b">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Pharma Equipment Overview</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and manage critical pharmaceutical manufacturing and lab equipment.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="h-8 shadow-none"
        >
          <RefreshCw className={cn("mr-2 h-3.5 w-3.5", refreshing && "animate-spin")} />
          Reload Data
        </Button>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="flex items-start gap-3 border bg-red-50/50 p-4 section-panel text-red-900 border-red-200">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Connection Error</p>
            <p className="text-sm text-red-800/80">{error}</p>
          </div>
        </div>
      )}

      {/* ── Overdue alert ── */}
      {!loading && equipment.length > 0 && (
        <OverdueAlert equipment={equipment} />
      )}

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 section-panel animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>
      )}

      {/* ── Main Layout Setup ── */}
      <div className="grid gap-6 lg:gap-8 xl:gap-10 xl:grid-cols-3 items-start">
        {/* Table taking 2/3 space */}
        <div className="xl:col-span-2 section-panel opacity-0 animate-fade-in delay-150 relative bg-slate-50/30 dark:bg-slate-950/10 border-slate-100 dark:border-slate-800/60">
          <div className="p-6 md:px-8 bg-slate-100/50 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Equipment Roster</h2>
          </div>
          <div className="p-6 md:p-8 overflow-x-auto">
            <EquipmentTable
              equipment={equipment}
              types={types}
              loading={loading}
              onRefresh={() => fetchAll(true)}
            />
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6 lg:space-y-8">
          <div className="section-panel opacity-0 animate-fade-in delay-225 relative bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-100/60 dark:border-emerald-900/30">
            <div className="p-6 bg-emerald-100/30 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/30">
              <h2 className="text-sm font-semibold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-wider">Health Status</h2>
            </div>
            <div className="p-6">
              <StatusChart equipment={equipment} />
            </div>
          </div>

          <div className="section-panel opacity-0 animate-fade-in delay-300 relative bg-indigo-50/20 dark:bg-indigo-950/10 border-indigo-100/60 dark:border-indigo-900/30">
            <div className="p-6 bg-indigo-100/30 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/30">
              <h2 className="text-sm font-semibold text-indigo-700/80 dark:text-indigo-400/80 uppercase tracking-wider">Recent Logs</h2>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <ActivityFeed logs={allLogs} equipment={equipment} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
