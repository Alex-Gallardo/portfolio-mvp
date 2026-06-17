"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["var(--brand-500)", "var(--accent)", "var(--warning)", "var(--fg-muted)"];

export function DevicesChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) return <p className="empty">Sin datos de dispositivos todavía.</p>;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={92}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--bg-elev)" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--bg-elev)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "13px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
