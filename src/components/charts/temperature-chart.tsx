"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import type { TemperatureDataPoint } from "@/types";

// ISO/IEC 17025 — Data Center Inlet Temperature Thresholds (ASHRAE A1)
// Setup: Sensor di dalam box bersama ESP32 (default warning=40, danger=60)
const DEFAULT_TEMP_WARNING = 40;
const DEFAULT_TEMP_DANGER = 60;

const chartConfig = {
  temperature: {
    label: "Temperature (°C)",
    color: "hsl(24, 95%, 53%)",
  },
};

interface Props {
  data: TemperatureDataPoint[];
  showThresholds?: boolean;
  tempWarning?: number;
  tempDanger?: number;
}

export function TemperatureChart({
  data,
  showThresholds = true,
  tempWarning = DEFAULT_TEMP_WARNING,
  tempDanger = DEFAULT_TEMP_DANGER,
}: Props) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        Belum ada data suhu
      </div>
    );
  }

  // Custom tooltip dengan warna status
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const temp: number = payload[0]?.value ?? 0;
    const isDanger  = temp >= tempDanger;
    const isWarning = temp > tempWarning && !isDanger;
    const color     = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";

    return (
      <div className="bg-background border border-border rounded-lg p-2.5 shadow-lg text-xs">
        <p className="font-medium text-muted-foreground mb-1">{label}</p>
        <p className="font-bold" style={{ color }}>
          {temp.toFixed(1)}°C
        </p>
        <p className="text-muted-foreground mt-0.5">
          {isDanger
            ? `🚨 DANGER — Alarm pemadam (≥${tempDanger}°C)`
            : isWarning
            ? `⚠️ WARNING — Melampaui batas normal (>${tempWarning}°C)`
            : `✅ Normal (18–${tempWarning}°C)`}
        </p>
      </div>
    );
  };

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 16, left: -4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            domain={["auto", "auto"]}
            tickFormatter={(v) => `${v}°C`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={() => "Suhu Inlet (°C)"}
            wrapperStyle={{ fontSize: "11px" }}
          />

          {/* ISO/IEC 17025 Reference Lines */}
          {showThresholds && (
            <>
              <ReferenceLine
                y={tempWarning}
                stroke="#f59e0b"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{
                  value: `⚠️ Warning >${tempWarning}°C`,
                  position: "insideTopRight",
                  fill: "#f59e0b",
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={tempDanger}
                stroke="#ef4444"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{
                  value: `🚨 Danger ≥${tempDanger}°C (pemadam)`,
                  position: "insideTopRight",
                  fill: "#ef4444",
                  fontSize: 10,
                }}
              />
            </>
          )}

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
