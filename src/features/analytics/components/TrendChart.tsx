"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function TrendChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--fg-muted)" }} tickLine={false} />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "var(--fg-muted)" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg-elev)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          labelStyle={{ color: "var(--fg)" }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="Visitas"
          stroke="var(--brand-500)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
