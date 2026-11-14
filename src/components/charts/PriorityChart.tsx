"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types";
import type { CategoryStat } from "@/types";

interface PriorityChartProps {
  data: CategoryStat[];
  height?: number;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: CategoryStat }>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs">
        <p className="font-semibold text-civic-text">
          {CATEGORY_LABELS[item.category]}
        </p>
        <p className="text-civic-cyan mt-0.5">
          {item.count.toLocaleString()} votes
        </p>
        <p className="text-civic-text-muted">{item.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

export function PriorityChart({ data, height = 220 }: PriorityChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 0, right: 16, bottom: 0, left: 70 }}
        barSize={10}
      >
        <XAxis
          type="number"
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={68}
          tickFormatter={(val) => CATEGORY_LABELS[val as keyof typeof CATEGORY_LABELS] || val}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {sorted.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CATEGORY_COLORS[entry.category] || "#00d4ff"}
              opacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
