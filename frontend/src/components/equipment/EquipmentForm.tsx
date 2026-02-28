"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Equipment, EquipmentType } from "@/lib/types";
import { createEquipment, updateEquipment } from "@/lib/api";

const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    typeId: z.string().min(1, "Please select a type"),
    status: z.enum(["Active", "Inactive", "Under Maintenance"]),
    lastCleanedDate: z.date().refine((d) => !!d, { message: "Please select a date" }),
});

type FormValues = z.infer<typeof schema>;

interface EquipmentFormProps {
    initialData?: Equipment;
    types: EquipmentType[];
    onSuccess: (equipment: Equipment) => void;
    onCancel: () => void;
}

export function EquipmentForm({
    initialData,
    types,
    onSuccess,
    onCancel,
}: EquipmentFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: initialData
            ? {
                name: initialData.name,
                typeId: String(initialData.typeId),
                status: initialData.status,
                lastCleanedDate: new Date(initialData.lastCleanedDate),
            }
            : {
                name: "",
                typeId: "",
                status: "Inactive",
                lastCleanedDate: undefined,
            },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: FormValues) {
        setServerError(null);
        const payload = {
            name: values.name,
            typeId: Number(values.typeId),
            status: values.status,
            lastCleanedDate: format(values.lastCleanedDate, "yyyy-MM-dd"),
        };
        try {
            let result: Equipment;
            if (initialData) {
                result = await updateEquipment(initialData.id, payload);
            } else {
                result = await createEquipment(payload);
            }
            onSuccess(result);
        } catch (err) {
            setServerError(err instanceof Error ? err.message : "Something went wrong");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Equipment Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. BioFlo 120 Bioreactor" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Type */}
                <FormField
                    control={form.control}
                    name="typeId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select equipment type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {types.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Status */}
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                    <SelectItem value="Under Maintenance">Under Maintenance</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Last Cleaned Date */}
                <FormField
                    control={form.control}
                    name="lastCleanedDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Cleaned Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {field.value
                                                ? format(field.value, "PPP")
                                                : "Pick a date"}
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Server error display */}
                {serverError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3">
                        <p className="text-sm text-destructive">{serverError}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Save Changes" : "Add Equipment"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
