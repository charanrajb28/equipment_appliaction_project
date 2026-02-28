"use client";

import { Clock, Wrench } from "lucide-react";
import type { MaintenanceLog, Equipment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/dateUtils";

interface ActivityFeedProps {
    logs: MaintenanceLog[];
    equipment: Equipment[];
}

export function ActivityFeed({ logs, equipment }: ActivityFeedProps) {
    const equipMap = Object.fromEntries(equipment.map((e) => [e.id, e.name]));
    const recent = [...logs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                {recent.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
                        <Wrench className="h-8 w-8 opacity-40" />
                        <p className="text-sm">No maintenance activity yet</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {recent.map((log) => (
                            <li
                                key={log.id}
                                className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <span className="text-xs font-semibold">
                                        {log.performedBy.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {equipMap[log.equipmentId] ?? `Equipment #${log.equipmentId}`}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        Maintained by {log.performedBy}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(log.maintenanceDate)}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
