"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";

import type {
  CountrySlice,
  DaySlice,
  DeviceSlice,
  HourSlice,
  RecentClickSlice,
  ReferrerSlice,
  WeekdaySlice,
} from "@/types/analytics";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AnalyticsKpiData {
  totalClicks: number;
  uniqueClicks: number;
  botClicks?: number;
}

export interface AnalyticsChartsProps {
  kpi: AnalyticsKpiData;
  dailyActivity: DaySlice[];
  deviceBreakdown: DeviceSlice[];
  hourlyActivity: HourSlice[];
  weeklyActivity: WeekdaySlice[];
  topReferrers: ReferrerSlice[];
  topCountries: CountrySlice[];
  recentClicks?: RecentClickSlice[];
}

// ─────────────────────────────────────────────
// Colour palette — CSS theme tokens so charts
// follow light/dark mode automatically
// ─────────────────────────────────────────────

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const BAR_COLOR = "var(--chart-1)";

// ─────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────

export function EmptyChartState() {
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
// KPI stat card
// ─────────────────────────────────────────────

export function StatCard({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: number;
  subtitle: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-bold tracking-tight tabular-nums">
          {value.toLocaleString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Ranked distribution list (referrers / countries)
// ─────────────────────────────────────────────

function RankedList({
  data,
  isEmpty,
}: {
  data: { label: string; clicks: number }[];
  isEmpty: boolean;
}) {
  if (isEmpty) return <EmptyChartState />;

  const total = data.reduce((sum, d) => sum + d.clicks, 0);

  return (
    <ul className="space-y-2.5 text-xs">
      {data.map((entry) => {
        const pct = total > 0 ? (entry.clicks / total) * 100 : 0;
        return (
          <li key={entry.label}>
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-foreground">
                {entry.label}
              </span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {entry.clicks.toLocaleString()}
              </span>
              <span className="w-11 text-right font-mono font-semibold tabular-nums">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(pct, 1.5)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// ─────────────────────────────────────────────
// Clicks over time (daily timeseries)
// ─────────────────────────────────────────────

export function ClicksOverTimeCard({
  data,
  isEmpty,
}: {
  data: DaySlice[];
  isEmpty: boolean;
}) {
  const chartData = data.map((d) => ({
    label: new Date(`${d.date}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    clicks: d.clicks,
  }));

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Clicks Over Time</CardTitle>
        <CardDescription>Daily clicks across the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyChartState />
        ) : (
          <div className="mt-1 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BAR_COLOR} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={BAR_COLOR} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ opacity: 0.08 }} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke={BAR_COLOR}
                  strokeWidth={2}
                  fill="url(#clicksFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Device donut
// ─────────────────────────────────────────────

function DeviceLegend({
  data,
  colors,
}: {
  data: DeviceSlice[];
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
            <span className="font-mono tabular-nums text-muted-foreground">
              {entry.clicks.toLocaleString()}
            </span>
            <span className="w-14 text-right font-mono font-semibold tabular-nums">
              {pct}%
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function DeviceBreakdownCard({
  data,
  isEmpty,
}: {
  data: DeviceSlice[];
  isEmpty: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Breakdown</CardTitle>
        <CardDescription>Click distribution by device type</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyChartState />
        ) : (
          <div className="mt-2 flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
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
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full min-w-0 flex-1">
              <DeviceLegend data={data} colors={CHART_COLORS} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Peak activity (hourly / weekly toggle)
// ─────────────────────────────────────────────

type PeakView = "hourly" | "weekly";

export function PeakActivityCard({
  hourlyData,
  weeklyData,
  isEmpty,
}: {
  hourlyData: HourSlice[];
  weeklyData: WeekdaySlice[];
  isEmpty: boolean;
}) {
  const [view, setView] = useState<PeakView>("hourly");

  const data =
    view === "hourly"
      ? hourlyData.map((d) => ({ label: d.hour, clicks: d.clicks }))
      : weeklyData.map((d) => ({ label: d.day, clicks: d.clicks }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Activity</CardTitle>
        <CardDescription>
          {view === "hourly"
            ? "Click distribution by hour of day"
            : "Click distribution by day of week"}
        </CardDescription>
        <CardAction>
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
        </CardAction>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyChartState />
        ) : (
          <div className="mt-2 h-52">
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
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Referrers & Countries
// ─────────────────────────────────────────────

export function ReferrersCard({
  data,
  isEmpty,
}: {
  data: ReferrerSlice[];
  isEmpty: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Referrers</CardTitle>
        <CardDescription>Traffic sources sending visitors</CardDescription>
      </CardHeader>
      <CardContent>
        <RankedList
          data={data.map((d) => ({ label: d.referrer, clicks: d.clicks }))}
          isEmpty={isEmpty}
        />
      </CardContent>
    </Card>
  );
}

export function CountriesCard({
  data,
  isEmpty,
}: {
  data: CountrySlice[];
  isEmpty: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Countries</CardTitle>
        <CardDescription>Where your clicks come from</CardDescription>
      </CardHeader>
      <CardContent>
        <RankedList
          data={data.map((d) => ({ label: d.country, clicks: d.clicks }))}
          isEmpty={isEmpty}
        />
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Recent clicks feed (per-link detail only)
// ─────────────────────────────────────────────

export function RecentClicksCard({
  clicks,
  isEmpty,
}: {
  clicks: RecentClickSlice[];
  isEmpty: boolean;
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>The 10 most recent recorded visits</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyChartState />
        ) : (
          <ul className="divide-y text-xs">
            {clicks.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
                <span className="font-mono tabular-nums text-muted-foreground">
                  {new Date(c.timestamp).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="min-w-[3.5rem] text-foreground">
                  {c.device ?? "Unknown"}
                </span>
                <span className="font-mono text-muted-foreground">
                  {c.country ?? "—"}
                </span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">
                  {c.referrer || "Direct"}
                </span>
                {c.isBot && (
                  <span className="border px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                    bot
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Main export — full per-link analytics composition
// ─────────────────────────────────────────────

export default function AnalyticsCharts({
  kpi,
  dailyActivity,
  deviceBreakdown,
  hourlyActivity,
  weeklyActivity,
  topReferrers,
  topCountries,
  recentClicks,
}: AnalyticsChartsProps) {
  const isEmpty = kpi.totalClicks === 0;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Clicks"
          value={kpi.totalClicks}
          subtitle="All visits excluding bots"
        />
        <StatCard
          label="Unique Visitors"
          value={kpi.uniqueClicks}
          subtitle="Distinct IP addresses"
        />
        {typeof kpi.botClicks === "number" && (
          <StatCard
            label="Filtered Bots"
            value={kpi.botClicks}
            subtitle="Crawler visits excluded from stats"
          />
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ClicksOverTimeCard data={dailyActivity} isEmpty={isEmpty} />
        <DeviceBreakdownCard data={deviceBreakdown} isEmpty={isEmpty} />
        <PeakActivityCard
          hourlyData={hourlyActivity}
          weeklyData={weeklyActivity}
          isEmpty={isEmpty}
        />
        <ReferrersCard data={topReferrers} isEmpty={isEmpty} />
        <CountriesCard data={topCountries} isEmpty={isEmpty} />
        {recentClicks && (
          <RecentClicksCard clicks={recentClicks} isEmpty={recentClicks.length === 0} />
        )}
      </div>
    </div>
  );
}
