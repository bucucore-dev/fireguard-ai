"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { AlertFrequencyPoint } from "@/types";

const chartConfig = {
  count: {
    label: "Alerts",
    color: "hsl(24, 95%, 53%)",
  },
};

interface Props {
  data: AlertFrequencyPoint[];
}

const getBarColor = (value: number) => {
  if (value >= 10) return "hsl(0, 72%, 51%)";
  if (value >= 5) return "hsl(38, 92%, 50%)";
  return "hsl(142, 71%, 45%)";
};

export function AlertChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No alert data available</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" className="text-xs" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
          <YAxis className="text-xs" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.count)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
