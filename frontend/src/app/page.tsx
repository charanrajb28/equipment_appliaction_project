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
    <div className="space-y-6">
      {/* ── Toolbar Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-4 border-b">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Pharma Equipment Overview</h1>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 section-panel animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>
      )}

      {/* ── Main Layout Setup ── */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Table taking 2/3 space */}
        <div className="xl:col-span-2 section-panel opacity-0 animate-fade-in delay-150">
          <div className="p-5 border-b bg-muted/20">
            <h2 className="text-sm font-medium">Equipment Roster</h2>
          </div>
          <div className="p-5 overflow-x-auto">
            <EquipmentTable
              equipment={equipment}
              types={types}
              loading={loading}
              onRefresh={() => fetchAll(true)}
            />
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="space-y-6">
          <div className="section-panel opacity-0 animate-fade-in delay-225">
            <div className="p-4 border-b bg-muted/20">
              <h2 className="text-sm font-medium">Health Status</h2>
            </div>
            <div className="p-4">
              <StatusChart equipment={equipment} />
            </div>
          </div>

          <div className="section-panel opacity-0 animate-fade-in delay-300">
            <div className="p-4 border-b bg-muted/20">
              <h2 className="text-sm font-medium">Recent Logs</h2>
            </div>
            <ActivityFeed logs={allLogs} equipment={equipment} />
          </div>
        </div>
      </div>
    </div>
  );
}
