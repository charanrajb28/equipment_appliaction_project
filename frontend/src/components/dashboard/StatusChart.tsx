"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Equipment } from "@/lib/types";

interface StatusChartProps {
    equipment: Equipment[];
}

import { getHealthScore } from "@/lib/dateUtils";

// Semantic colors for clear health status visibility
const STATUS_CONFIG = [
    { key: "Excellent Health", color: "#059669", type: "health" }, // Emerald 600
    { key: "Good Health", color: "#2563eb", type: "health" },      // Blue 600
    { key: "Fair Health", color: "#d97706", type: "health" },      // Amber 600
    { key: "Overdue Care", color: "#dc2626", type: "health" },     // Red 600
];

export function StatusChart({ equipment }: StatusChartProps) {
    const data = STATUS_CONFIG.map(({ key, color, type }) => {
        const pureKey = key.replace(" Health", "").replace(" Care", "");
        const count = equipment.filter((e) => getHealthScore(e.lastCleanedDate) === pureKey).length;

        return {
            name: key,
            value: count,
            color,
            type
        };
    });

    const total = data.reduce((s, d) => s + d.value, 0);
    // filter for pie chart only items > 0 to avoid rendering issues with 0 values in Pie
    const pieData = data.filter(d => d.value > 0);

    return (
        <div>
            <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                    <Pie
                        data={pieData.length > 0 ? pieData : [{ name: "No Data", value: 1, color: "#f3f4f6" }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {pieData.length > 0 ? (
                            pieData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))
                        ) : (
                            <Cell key="empty" fill="#f3f4f6" />
                        )}
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

            {/* Structured data table legend - shows all even if 0 */}
            <div className="mt-4 border-t divide-y text-xs">
                {data.map((d) => {
                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                    return (
                        <div key={d.name} className="flex justify-between items-center py-1.5">
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
