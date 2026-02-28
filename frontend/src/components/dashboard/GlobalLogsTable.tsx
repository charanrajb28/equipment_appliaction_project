"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, FileText, ChevronLeft, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MaintenanceLog, Equipment, EquipmentType } from "@/lib/types";
import { formatDate } from "@/lib/dateUtils";

interface GlobalLogsTableProps {
    logs: MaintenanceLog[];
    equipment: Equipment[];
    types: EquipmentType[];
}

export function GlobalLogsTable({ logs, equipment, types }: GlobalLogsTableProps) {
    const [filterType, setFilterType] = useState<string>("all");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Combine logs with equipment data
    const enrichedLogs = logs.map(log => {
        const eq = equipment.find(e => e.id === log.equipmentId);
        return {
            ...log,
            equipmentName: eq?.name || "Unknown Equipment",
            equipmentType: eq?.typeName || "Unknown Type",
            typeId: eq?.typeId
        };
    });

    // Apply filters
    const filteredLogs = enrichedLogs.filter(log => {
        if (filterType !== "all" && log.typeId?.toString() !== filterType) return false;

        if (startDate) {
            if (new Date(log.maintenanceDate) < new Date(startDate)) return false;
        }

        if (endDate) {
            if (new Date(log.maintenanceDate) > new Date(endDate)) return false;
        }

        return true;
    });

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 border rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex-1 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equipment Category</Label>
                    <Select value={filterType} onValueChange={(val) => { setFilterType(val); setCurrentPage(1); }}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {types.map(t => (
                                <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">From Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            className="pl-9 bg-background"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="flex-1 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="date"
                            className="pl-9 bg-background"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                {(filterType !== "all" || startDate || endDate) && (
                    <div className="flex items-end pb-0.5">
                        <Button
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => {
                                setFilterType("all");
                                setStartDate("");
                                setEndDate("");
                                setCurrentPage(1);
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="border rounded-xl overflow-hidden bg-background">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Equipment</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Performed By</th>
                                <th className="px-4 py-3 font-medium">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y relative">
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground relative z-10">
                                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        <p>No maintenance logs match your filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(log.maintenanceDate)}</td>
                                        <td className="px-4 py-3 font-medium">{log.equipmentName}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground">
                                                {log.equipmentType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">{log.performedBy}</td>
                                        <td className="px-4 py-3 max-w-sm truncate text-muted-foreground" title={log.notes}>
                                            {log.notes || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/20">
                        <span className="text-xs text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
