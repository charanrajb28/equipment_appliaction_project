"use client";

import { Activity } from "lucide-react";
import type { MaintenanceLog, Equipment } from "@/lib/types";
import { formatDate } from "@/lib/dateUtils";

interface ActivityFeedProps {
    logs: MaintenanceLog[];
    equipment: Equipment[];
}

export function ActivityFeed({ logs, equipment }: ActivityFeedProps) {
    const equipMap = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
    const recent = [...logs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

    if (recent.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                <Activity className="h-6 w-6 opacity-20 mb-2" />
                <p className="text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <ul className="divide-y relative">
            {/* Subtle timeline track */}
            <div className="absolute left-[27px] top-6 bottom-6 w-px bg-border/50 -z-10" />

            {recent.map((log) => {
                return (
                    <li
                        key={log.id}
                        className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                        {/* Minimal avatar */}
                        <div className="flex h-7 w-7 mt-0.5 shrink-0 items-center justify-center rounded-sm bg-muted border text-xs font-semibold">
                            {log.performedBy.slice(0, 1).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium leading-none">
                                    {equipMap[log.equipmentId] ?? `Asset #${log.equipmentId}`}
                                </p>
                                <time className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                                    {formatDate(log.maintenanceDate)}
                                </time>
                            </div>
                            <p className="truncate text-xs text-muted-foreground">
                                Serviced by {log.performedBy}
                            </p>
                            {log.notes && (
                                <p className="text-xs italic text-muted-foreground/80 truncate mt-1">
                                    "{log.notes}"
                                </p>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
