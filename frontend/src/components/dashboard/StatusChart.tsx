"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Equipment } from "@/lib/types";

interface StatusChartProps {
    equipment: Equipment[];
}

// Semantic colors for clear status visibility
const STATUS_CONFIG = [
    { key: "Active", color: "#10b981" }, // Emerald 500
    { key: "Inactive", color: "#f43f5e" }, // Rose 500
    { key: "Under Maintenance", color: "#f59e0b" }, // Amber 500
];

export function StatusChart({ equipment }: StatusChartProps) {
    const data = STATUS_CONFIG.map(({ key, color }) => ({
        name: key,
        value: equipment.filter((e) => e.status === key).length,
        color,
    })).filter((d) => d.value > 0);

    const total = data.reduce((s, d) => s + d.value, 0);

    if (data.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-muted-foreground">No data available</p>
            </div>
        );
    }

    return (
        <div>
            <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {data.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            borderRadius: "0.15rem",
                            border: "1px solid #e4e4e7",
                            fontSize: "12px",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Structured data table legend */}
            <div className="mt-4 border-t divide-y text-xs">
                {data.map((d) => {
                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                    return (
                        <div key={d.name} className="flex justify-between items-center py-2">
                            <span className="flex items-center gap-2 text-muted-foreground">
                                <span
                                    className="inline-block h-2 w-2"
                                    style={{ backgroundColor: d.color }}
                                />
                                {d.name}
                            </span>
                            <span className="font-medium font-mono">
                                {d.value} <span className="text-muted-foreground ml-1">({pct}%)</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
