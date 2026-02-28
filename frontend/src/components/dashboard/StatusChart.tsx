"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Equipment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatusChartProps {
    equipment: Equipment[];
}

const COLORS: Record<string, string> = {
    Active: "#10b981",
    Inactive: "#94a3b8",
    "Under Maintenance": "#f59e0b",
};

export function StatusChart({ equipment }: StatusChartProps) {
    const counts: Record<string, number> = {
        Active: 0,
        Inactive: 0,
        "Under Maintenance": 0,
    };
    equipment.forEach((e) => { counts[e.status] = (counts[e.status] || 0) + 1; });

    const data = Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));

    if (data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex h-40 items-center justify-center">
                    <p className="text-sm text-muted-foreground">No equipment data</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {data.map((entry) => (
                                <Cell key={entry.name} fill={COLORS[entry.name] ?? "#cbd5e1"} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                            formatter={(value) => (
                                <span className="text-xs text-foreground">{value}</span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
