"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import type { Equipment } from "@/lib/types";
import { isOverdue, daysSinceDate } from "@/lib/dateUtils";

interface OverdueAlertProps {
    equipment: Equipment[];
}

export function OverdueAlert({ equipment }: OverdueAlertProps) {
    const [dismissed, setDismissed] = useState(false);
    const overdue = equipment.filter((e) => isOverdue(e.lastCleanedDate));

    if (dismissed || overdue.length === 0) return null;

    return (
        <div className="section-panel bg-red-50/50 border-red-200 border-l-[3px] border-l-red-500 rounded-none p-3 shadow-none">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                    <p className="text-sm font-medium text-red-900">
                        {overdue.length} asset{overdue.length > 1 ? "s" : ""} required scheduled maintenance over 30 days ago.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        {overdue.slice(0, 2).map((e) => (
                            <span
                                key={e.id}
                                className="inline-flex items-center gap-1 bg-white border border-red-100 px-2 py-0.5 text-xs font-mono text-red-700"
                            >
                                {e.name}
                                <span className="text-red-400">/{daysSinceDate(e.lastCleanedDate)}d</span>
                            </span>
                        ))}
                        {overdue.length > 2 && (
                            <span className="text-xs text-red-600 font-mono">+{overdue.length - 2} more</span>
                        )}
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-red-600/70 hover:text-red-900 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
