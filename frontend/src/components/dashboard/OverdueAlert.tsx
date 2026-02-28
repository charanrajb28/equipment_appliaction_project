"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import type { Equipment } from "@/lib/types";
import { isOverdue } from "@/lib/dateUtils";

interface OverdueAlertProps {
    equipment: Equipment[];
}

export function OverdueAlert({ equipment }: OverdueAlertProps) {
    const [dismissed, setDismissed] = useState(false);
    const overdue = equipment.filter((e) => isOverdue(e.lastCleanedDate));

    if (dismissed || overdue.length === 0) return null;

    return (
        <div className="relative flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">
                    {overdue.length} equipment item{overdue.length > 1 ? "s" : ""} overdue for cleaning
                </p>
                <p className="text-xs">
                    {overdue.map((e) => e.name).join(", ")} — last cleaned more than 30 days ago.
                    These cannot be set to Active status until maintenance is logged.
                </p>
            </div>
            <button
                onClick={() => setDismissed(true)}
                className="ml-auto shrink-0 rounded p-0.5 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                aria-label="Dismiss alert"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
