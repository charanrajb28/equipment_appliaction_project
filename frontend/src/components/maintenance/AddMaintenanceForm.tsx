"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";

import { addMaintenance } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const schema = z.object({
    maintenanceDate: z.date().refine((d) => !!d, { message: "Please pick a date" }),
    performedBy: z.string().min(2, "Name must be at least 2 characters"),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddMaintenanceFormProps {
    equipmentId: number;
    onSuccess: () => void;
}

export function AddMaintenanceForm({
    equipmentId,
    onSuccess,
}: AddMaintenanceFormProps) {
    const [serverError, setServerError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            performedBy: "",
            notes: "",
            maintenanceDate: new Date(),
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: FormValues) {
        setServerError(null);
        try {
            await addMaintenance({
                equipmentId,
                maintenanceDate: format(values.maintenanceDate, "yyyy-MM-dd"),
                performedBy: values.performedBy,
                notes: values.notes || "",
            });
            setSubmitted(true);
            form.reset();
            onSuccess();
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            setServerError(
                err instanceof Error ? err.message : "Something went wrong"
            );
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {submitted && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                        Maintenance logged successfully! Equipment status updated to Active.
                    </div>
                )}

                {/* Maintenance Date */}
                <FormField
                    control={form.control}
                    name="maintenanceDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Maintenance Date</FormLabel>
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
                                            {field.value ? format(field.value, "PPP") : "Pick a date"}
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

                {/* Performed By */}
                <FormField
                    control={form.control}
                    name="performedBy"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Performed By</FormLabel>
                            <FormControl>
                                <Input placeholder="Technician name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Notes */}
                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Optional maintenance notes…"
                                    className="resize-none"
                                    rows={3}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {serverError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3">
                        <p className="text-sm text-destructive">{serverError}</p>
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log Maintenance
                </Button>
            </form>
        </Form>
    );
}
