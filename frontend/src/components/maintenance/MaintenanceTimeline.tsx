"use client";

import type { MaintenanceLog } from "@/lib/types";
import { formatDate } from "@/lib/dateUtils";
import { Wrench } from "lucide-react";

interface MaintenanceTimelineProps {
    logs: MaintenanceLog[];
}

export function MaintenanceTimeline({ logs }: MaintenanceTimelineProps) {
    const sorted = [...logs].sort(
        (a, b) =>
            new Date(b.maintenanceDate).getTime() -
            new Date(a.maintenanceDate).getTime()
    );

    if (sorted.length === 0) {
        return (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                <Wrench className="h-8 w-8 opacity-30" />
                <p className="text-sm">No maintenance records yet</p>
            </div>
        );
    }

    return (
        <ol className="relative space-y-1 border-l border-border pl-5">
            {sorted.map((log) => (
                <li key={log.id} className="relative pb-6">
                    {/* Timeline dot */}
                    <span className="absolute -left-[1.35rem] flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 ring-4 ring-background">
                        <Wrench className="h-3 w-3 text-primary" />
                    </span>

                    <div className="ml-2 rounded-lg border bg-card p-3 shadow-sm">
                        <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-primary">
                                {formatDate(log.maintenanceDate)}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                Completed
                            </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {log.performedBy}
                        </p>
                        {log.notes && (
                            <p className="mt-1 text-xs text-muted-foreground">{log.notes}</p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}
