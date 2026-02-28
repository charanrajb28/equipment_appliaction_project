import { differenceInDays, format, parseISO } from "date-fns";
import type { HealthScore } from "./types";

export function daysSinceDate(dateStr: string): number {
    return differenceInDays(new Date(), parseISO(dateStr));
}

export function getHealthScore(lastCleanedDate: string): HealthScore {
    const days = daysSinceDate(lastCleanedDate);
    if (days <= 7) return "Excellent";
    if (days <= 15) return "Good";
    if (days <= 30) return "Fair";
    return "Overdue";
}

export function isOverdue(lastCleanedDate: string): boolean {
    return daysSinceDate(lastCleanedDate) > 30;
}

export function formatDate(dateStr: string): string {
    try {
        return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
        return dateStr;
    }
}

export function toInputDate(dateStr: string): string {
    try {
        return format(parseISO(dateStr), "yyyy-MM-dd");
    } catch {
        return dateStr;
    }
}
