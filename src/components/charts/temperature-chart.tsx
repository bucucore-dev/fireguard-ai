"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { TemperatureDataPoint } from "@/types";

const chartConfig = {
  temperature: {
    label: "Temperature",
    color: "hsl(24, 95%, 53%)",
  },
};

interface Props {
  data: TemperatureDataPoint[];
}

export function TemperatureChart({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">No temperature data available</div>;
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="time" className="text-xs" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
          <YAxis className="text-xs" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} domain={["auto", "auto"]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="var(--color-temperature)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
