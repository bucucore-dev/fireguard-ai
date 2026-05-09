"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DeviceActivityPoint } from "@/types";

const chartConfig = {
  count: {
    label: "Alerts",
    color: "hsl(24, 95%, 53%)",
  },
};

interface Props {
  data: DeviceActivityPoint[];
}

const colors = [
  "hsl(0, 72%, 51%)",
  "hsl(38, 92%, 50%)",
  "hsl(142, 71%, 45%)",
  "hsl(221, 83%, 53%)",
  "hsl(280, 67%, 55%)",
  "hsl(340, 75%, 55%)",
];

export function DeviceActivityChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No activity data available</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
          <XAxis type="number" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} allowDecimals={false} />
          <YAxis dataKey="deviceName" type="category" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} width={100} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
