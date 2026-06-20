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

// ISO/IEC 17025 threshold untuk asap (estimasi % dari ADC/4095*100)
// Mapping ke % obscuration relatif berdasarkan kurva MQ-2:
// ADC 1200/4095 ≈ 29.3% → warning
// ADC 2500/4095 ≈ 61.0% → danger
const SMOKE_WARNING_PCT = (1200 / 4095) * 100; // ~29.3%
const SMOKE_DANGER_PCT  = (2500 / 4095) * 100; // ~61.0%

const chartConfig = {
  smokePercent: {
    label: "Smoke Level (%)",
    color: "hsl(38, 92%, 50%)",
  },
};

interface Props {
  data: TemperatureDataPoint[]; // reuse type — field smokePercent opsional
  showThresholds?: boolean;
}

// Custom tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val: number = payload[0]?.value ?? 0;
  const isWarning = val >= SMOKE_WARNING_PCT && val < SMOKE_DANGER_PCT;
  const isDanger  = val >= SMOKE_DANGER_PCT;
  const color     = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981";

  return (
    <div className="bg-background border border-border rounded-lg p-2.5 shadow-lg text-xs">
      <p className="font-medium text-muted-foreground mb-1">{label}</p>
      <p className="font-bold" style={{ color }}>
        Smoke: {val.toFixed(2)}%
      </p>
      <p className="text-muted-foreground mt-0.5">
        {isDanger ? "🚨 DANGER — Alarm pemadam" : isWarning ? "⚠️ WARNING — Asap terdeteksi" : "✅ Normal"}
      </p>
    </div>
  );
};

export function SmokeChart({ data, showThresholds = true }: Props) {
  // Filter ke data yang punya smokePercent valid
  const chartData = data
    .filter((d) => d.smokePercent !== null && d.smokePercent !== undefined && d.smokePercent >= 0)
    .map((d) => ({ time: d.time, smokePercent: d.smokePercent as number }));

  if (chartData.length === 0) {
    return (
      <div className="h-[250px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
        <span className="text-2xl">💨</span>
        <p>Belum ada data asap — menunggu sensor MQ-2 warm-up selesai</p>
        <p className="text-xs opacity-60">Data muncul setelah ±3 menit pertama</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 16, left: -4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            domain={[0, Math.max(100, ...(chartData.map((d) => d.smokePercent + 5)))]}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={() => "Smoke Level (% ADC)"}
            wrapperStyle={{ fontSize: "11px" }}
          />

          {/* ISO/IEC 17025 Reference Lines */}
          {showThresholds && (
            <>
              <ReferenceLine
                y={SMOKE_WARNING_PCT}
                stroke="#f59e0b"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{
                  value: `⚠️ Warning ~0.03%/m (ADC 1200)`,
                  position: "insideTopRight",
                  fill: "#f59e0b",
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={SMOKE_DANGER_PCT}
                stroke="#ef4444"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{
                  value: `🚨 Danger ~0.06%/m (ADC 2500)`,
                  position: "insideTopRight",
                  fill: "#ef4444",
                  fontSize: 10,
                }}
              />
            </>
          )}

          <Line
            type="monotone"
            dataKey="smokePercent"
            stroke="var(--color-smokePercent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
