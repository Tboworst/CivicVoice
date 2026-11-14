"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { ActivityDataPoint } from "@/types";

interface ActivityChartProps {
  data: ActivityDataPoint[];
  height?: number;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs space-y-1">
        <p className="font-semibold text-civic-text">{label}</p>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-civic-text-muted capitalize">{p.name}:</span>
            <span style={{ color: p.color }} className="font-semibold">
              {p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ActivityChart({ data, height = 200 }: ActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="issuesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="votesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="proposalsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#84cc16" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "#64748b", paddingTop: "8px" }}
        />
        <Area
          type="monotone"
          dataKey="issues"
          stroke="#00d4ff"
          strokeWidth={1.5}
          fill="url(#issuesGrad)"
        />
        <Area
          type="monotone"
          dataKey="votes"
          stroke="#3b82f6"
          strokeWidth={1.5}
          fill="url(#votesGrad)"
        />
        <Area
          type="monotone"
          dataKey="proposals"
          stroke="#84cc16"
          strokeWidth={1.5}
          fill="url(#proposalsGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
