"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/types";
import type { CategoryStat } from "@/types";

interface CategoryPieChartProps {
  data: CategoryStat[];
  height?: number;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryStat }>;
}) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs">
        <p className="font-semibold text-civic-text">
          {CATEGORY_LABELS[item.category]}
        </p>
        <p className="text-civic-cyan mt-0.5">{item.percentage}% of issues</p>
        <p className="text-civic-text-muted">{item.count} total votes</p>
      </div>
    );
  }
  return null;
};

export function CategoryPieChart({ data, height = 240 }: CategoryPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CATEGORY_COLORS[entry.category]}
              opacity={0.85}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#94a3b8", fontSize: "11px" }}>
              {CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] || value}
            </span>
          )}
          wrapperStyle={{ paddingTop: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
