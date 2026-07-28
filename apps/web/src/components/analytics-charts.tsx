"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface KpiData {
  totalClicks: number;
  uniqueClicks: number;
}

export interface DeviceData {
  device: string;
  clicks: number;
}

export interface HourlyData {
  hour: string; // "00" – "23"
  clicks: number;
}

export interface WeeklyData {
  day: string; // "Mon" – "Sun"
  clicks: number;
}

export interface AnalyticsChartsProps {
  kpi: KpiData;
  deviceBreakdown: DeviceData[];
  hourlyActivity: HourlyData[];
  weeklyActivity: WeeklyData[];
}

// ─────────────────────────────────────────────
// Colour palette (matches CSS chart tokens)
// ─────────────────────────────────────────────

const DEVICE_COLORS = [
  "#6e8efb", // Desktop  – chart-1-ish (blue-violet)
  "#a78bfa", // Mobile   – purple
  "#34d399", // Tablet   – emerald
  "#f59e0b", // Smart TV – amber
  "#94a3b8", // Other    – slate
];

const BAR_COLOR = "#6e8efb";

// ─────────────────────────────────────────────
// Empty state placeholder (zero clicks)
// ─────────────────────────────────────────────

function EmptyChartState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-10 text-center">
      <BarChart3 className="size-8 text-muted-foreground/40" />
      <p className="max-w-[22rem] text-xs text-muted-foreground">
        No click activity recorded yet.{" "}
        <span className="text-foreground/70">
          Share your shortened link to start collecting analytics!
        </span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────

function KpiCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: number;
  subtitle: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-4xl font-bold tracking-tight">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Custom Donut Legend
// ─────────────────────────────────────────────

function DeviceLegend({
  data,
  colors,
}: {
  data: DeviceData[];
  colors: string[];
}) {
  const total = data.reduce((sum, d) => sum + d.clicks, 0);
  return (
    <ul className="mt-4 space-y-2 text-sm">
      {data.map((entry, i) => {
        const pct = total > 0 ? ((entry.clicks / total) * 100).toFixed(1) : "0.0";
        return (
          <li key={entry.device} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: colors[i] }}
            />
            <span className="flex-1 text-foreground">{entry.device}</span>
            <span className="font-mono text-muted-foreground">
              {entry.clicks.toLocaleString()}
            </span>
            <span className="w-14 text-right font-mono font-semibold">
              {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name?: string; fill?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      {label && (
        <p className="mb-1 font-semibold text-popover-foreground">{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="text-muted-foreground">
          Clicks:{" "}
          <span className="font-semibold text-foreground">
            {p.value.toLocaleString()}
          </span>
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Device Donut Chart
// ─────────────────────────────────────────────

function DeviceBreakdownCard({
  data,
  isEmpty,
}: {
  data: DeviceData[];
  isEmpty: boolean;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-base font-semibold">Device Breakdown</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Click distribution by device type
      </p>

      {isEmpty ? (
        <div className="mt-4">
          <EmptyChartState />
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
          <div className="h-56 w-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="clicks"
                  nameKey="device"
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill={DEVICE_COLORS[i % DEVICE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full min-w-0 flex-1">
            <DeviceLegend data={data} colors={DEVICE_COLORS} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Peak Activity Bar Chart
// ─────────────────────────────────────────────

type PeakView = "hourly" | "weekly";

function PeakActivityCard({
  hourlyData,
  weeklyData,
  isEmpty,
}: {
  hourlyData: HourlyData[];
  weeklyData: WeeklyData[];
  isEmpty: boolean;
}) {
  const [view, setView] = useState<PeakView>("hourly");

  const data =
    view === "hourly"
      ? hourlyData.map((d) => ({ label: d.hour, clicks: d.clicks }))
      : weeklyData.map((d) => ({ label: d.day, clicks: d.clicks }));

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      {/* Header + Toggle */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Peak Activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {view === "hourly"
              ? "Click distribution by hour of day"
              : "Click distribution by day of week"}
          </p>
        </div>

        <div
          role="group"
          aria-label="Activity view toggle"
          className="flex overflow-hidden rounded-md border text-xs font-medium"
        >
          {(["hourly", "weekly"] as PeakView[]).map((v) => (
            <button
              key={v}
              id={`peak-toggle-${v}`}
              onClick={() => setView(v)}
              disabled={isEmpty}
              className={`px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart or empty state */}
      {isEmpty ? (
        <div className="mt-6">
          <EmptyChartState />
        </div>
      ) : (
        <div className="mt-6 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barSize={view === "hourly" ? 8 : 24}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={view === "hourly" ? 3 : 0}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ opacity: 0.08 }} />
              <Bar dataKey="clicks" fill={BAR_COLOR} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────

export default function AnalyticsCharts({
  kpi,
  deviceBreakdown,
  hourlyActivity,
  weeklyActivity,
}: AnalyticsChartsProps) {
  const isEmpty = kpi.totalClicks === 0;

  return (
    <div className="space-y-8">
      {/* KPI Row — always shows real numbers (0 when empty) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          label="Total Clicks"
          value={kpi.totalClicks}
          subtitle="All recorded link clicks"
        />
        <KpiCard
          label="Unique Clicks"
          value={kpi.uniqueClicks}
          subtitle="Distinct visitors (de-duplicated)"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DeviceBreakdownCard data={deviceBreakdown} isEmpty={isEmpty} />
        <PeakActivityCard
          hourlyData={hourlyActivity}
          weeklyData={weeklyActivity}
          isEmpty={isEmpty}
        />
      </div>
    </div>
  );
}
