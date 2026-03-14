"use client";

import { useState, useMemo } from "react";
import {
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    Pencil,
    Trash2,
    Eye,
    Plus,
    Search,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
} from "lucide-react";

import type { Equipment, EquipmentType, EquipmentStatus } from "@/lib/types";
import { deleteEquipment } from "@/lib/api";
import { formatDate, isOverdue } from "@/lib/dateUtils";
import { StatusBadge } from "./StatusBadge";
import { EquipmentForm } from "./EquipmentForm";
import { EquipmentSheet } from "./EquipmentSheet";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

type SortKey = "name" | "typeName" | "status" | "lastCleanedDate";
type SortDir = "asc" | "desc" | null;

interface EquipmentTableProps {
    equipment: Equipment[];
    types: EquipmentType[];
    loading: boolean;
    onRefresh: () => void;
}

export function EquipmentTable({
    equipment,
    types,
    loading,
    onRefresh,
}: EquipmentTableProps) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<EquipmentStatus | "All">("All");
    const [typeFilter, setTypeFilter] = useState<string>("All");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(1);

    // Form dialog
    const [formOpen, setFormOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Equipment | null>(null);

    // Detail sheet
    const [sheetTarget, setSheetTarget] = useState<Equipment | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // --- Filtering & Sorting ---
    const filtered = useMemo(() => {
        let list = [...equipment];

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (e) =>
                    e.name.toLowerCase().includes(q) ||
                    e.typeName.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== "All") {
            list = list.filter((e) => e.status === statusFilter);
        }
        if (typeFilter !== "All") {
            list = list.filter((e) => String(e.typeId) === typeFilter);
        }
        if (sortKey && sortDir) {
            list.sort((a, b) => {
                const va = a[sortKey] ?? "";
                const vb = b[sortKey] ?? "";
                const cmp = String(va).localeCompare(String(vb));
                return sortDir === "asc" ? cmp : -cmp;
            });
        }
        return list;
    }, [equipment, search, statusFilter, typeFilter, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function handleSort(key: SortKey) {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
        setPage(1);
    }

    function SortIcon({ col }: { col: SortKey }) {
        if (sortKey !== col) return <ChevronsUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
        if (sortDir === "asc") return <ChevronUp className="ml-1 inline h-3 w-3" />;
        if (sortDir === "desc") return <ChevronDown className="ml-1 inline h-3 w-3" />;
        return <ChevronsUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteEquipment(deleteTarget.id);
            onRefresh();
        } catch {
            // swallow — real app would toast
        } finally {
            setDeleting(false);
            setDeleteOpen(false);
            setDeleteTarget(null);
        }
    }

    const statusTabs: (EquipmentStatus | "All")[] = [
        "All",
        "Active",
        "Under Maintenance",
        "Inactive",
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Pharma Asset Registry</h2>
                    <p className="text-sm text-muted-foreground">
                        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                        {search || statusFilter !== "All" || typeFilter !== "All"
                            ? " matched"
                            : " total"}
                    </p>
                </div>

            </div>

            {/* Quick-filter tabs */}
            <Tabs
                value={statusFilter}
                onValueChange={(v) => {
                    setStatusFilter(v as EquipmentStatus | "All");
                    setPage(1);
                }}
            >
                <TabsList className="rounded-full">
                    {statusTabs.map((s) => (
                        <TabsTrigger key={s} value={s} className="rounded-full">
                            {s}
                            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                                {s === "All"
                                    ? equipment.length
                                    : equipment.filter((e) => e.status === s).length}
                            </span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Search + type filter */}
            <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or type…"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="pl-9"
                    />
                </div>
                <Select
                    value={typeFilter}
                    onValueChange={(v) => {
                        setTypeFilter(v);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-52">
                        <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Types</SelectItem>
                        {types.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead
                                className="cursor-pointer select-none"
                                onClick={() => handleSort("name")}
                            >
                                Name <SortIcon col="name" />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none"
                                onClick={() => handleSort("typeName")}
                            >
                                Type <SortIcon col="typeName" />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none"
                                onClick={() => handleSort("status")}
                            >
                                Status <SortIcon col="status" />
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none"
                                onClick={() => handleSort("lastCleanedDate")}
                            >
                                Last Cleaned <SortIcon col="lastCleanedDate" />
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {Array.from({ length: 5 }).map((__, j) => (
                                        <TableCell key={j}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : paginated.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-12 text-center text-muted-foreground"
                                >
                                    No equipment found
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginated.map((eq) => {
                                const overdue = isOverdue(eq.lastCleanedDate);
                                return (
                                    <TableRow
                                        key={eq.id}
                                        className={cn(overdue && "border-l-2 border-l-amber-400")}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {eq.name}
                                                {overdue && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Overdue for cleaning (&gt;30 days)</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {eq.typeName}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={eq.status} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(eq.lastCleanedDate)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                router.push(`/equipment?id=${eq.id}`);
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>View Details</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => {
                                                                setEditTarget(eq);
                                                                setFormOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                setDeleteTarget(eq);
                                                                setDeleteOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete</TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-xs text-muted-foreground">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={page === 1}
                            onClick={() => setPage((p) => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={page === totalPages}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? "Edit Equipment" : "Add Equipment"}
                        </DialogTitle>
                    </DialogHeader>
                    <EquipmentForm
                        initialData={editTarget ?? undefined}
                        types={types}
                        onSuccess={(updated) => {
                            setFormOpen(false);
                            onRefresh();
                        }}
                        onCancel={() => setFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Equipment</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                            {deleteTarget?.name}
                        </span>
                        ? This will also delete all its maintenance logs. This action
                        cannot be undone.
                    </p>
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setDeleteOpen(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Detail Sheet */}
            <EquipmentSheet
                equipment={sheetTarget}
                open={sheetOpen}
                onOpenChange={(o) => {
                    setSheetOpen(o);
                    if (!o) setSheetTarget(null);
                }}
                onEquipmentUpdated={onRefresh}
            />
        </div>
    );
}
