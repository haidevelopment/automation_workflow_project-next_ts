"use client";

import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardChartPoint = {
  date: string;
  success: number;
  failed: number;
  runs: number;
  creditsConsumed: number;
};

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as DashboardChartPoint | undefined;
  if (!p) return null;

  return (
    <div className="rounded-md border bg-background p-3 text-sm shadow-sm">
      <div className="font-medium">Ngày {p.date}</div>
      <div className="mt-2 space-y-1 text-muted-foreground">
        <div>Runs: {p.runs}</div>
        <div>Credits: {p.creditsConsumed}</div>
        <div>Success: {p.success}</div>
        <div>Failed: {p.failed}</div>
      </div>
    </div>
  );
}

export default function DashboardChart({ data }: { data: DashboardChartPoint[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickMargin={8} fontSize={12} />
          <YAxis allowDecimals={false} fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="success" name="Success" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
