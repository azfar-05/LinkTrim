"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Monitor, Smartphone, Tablet } from "lucide-react";

const DAYS = [
  "Jul 1", "Jul 4", "Jul 7", "Jul 10", "Jul 13", "Jul 16", "Jul 19",
  "Jul 22", "Jul 25", "Jul 28", "Jul 31",
];

// Deterministic sample shaped like a typical weekday-heavy traffic pattern
const SERIES = [
  120, 180, 240, 210, 320, 380, 350, 420, 510, 480, 620, 580, 700, 660,
  820, 900, 860, 1040, 980, 1120, 1240, 1180, 1320, 1280, 1450, 1520,
  1470, 1610, 1720, 1680,
];

const DATA = DAYS.map((label, i) => ({
  label,
  clicks: SERIES[Math.round((i * (SERIES.length - 1)) / (DAYS.length - 1))],
}));

const DEVICES = [
  { name: "Desktop", value: 52, icon: Monitor },
  { name: "Mobile", value: 38, icon: Smartphone },
  { name: "Tablet", value: 10, icon: Tablet },
];

const REFERRERS = [
  { name: "google.com", pct: 38 },
  { name: "Direct", pct: 27 },
  { name: "x.com", pct: 14 },
  { name: "github.com", pct: 11 },
];

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)"];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-popover-foreground">{label}</p>
      <p className="text-muted-foreground">
        Clicks:{" "}
        <span className="font-semibold text-foreground">
          {payload[0].value.toLocaleString()}
        </span>
      </p>
    </div>
  );
}

export function AnalyticsPreview() {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const host = origin ? new URL(origin).host : "localhost:3001";

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm ring-1 ring-foreground/10">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="size-2.5 rounded-full bg-muted-foreground/25" />
        <span className="ml-3 truncate rounded-md bg-background px-3 py-1 font-mono text-[11px] text-muted-foreground ring-1 ring-foreground/10">
          {host && `${host}/orgs/demo-org/analytics`}
        </span>
      </div>

      {/* Mock app tabs */}
      <div className="flex items-center gap-1 border-b px-4 pt-2.5 sm:px-6">
        {["Overview", "Links", "Analytics"].map((tab, i) => (
          <span
            key={tab}
            className={`rounded-t-md border border-b-0 px-3 py-1.5 text-xs ${
              i === 2
                ? "-mb-px bg-card font-medium text-foreground"
                : "border-transparent text-muted-foreground"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="grid gap-3 p-4 sm:p-6">
        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total clicks", value: "31,486" },
            { label: "Unique visitors", value: "18,204" },
            { label: "Filtered bots", value: "412" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border bg-background px-4 py-3"
            >
              <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                {kpi.label}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums tracking-tight sm:text-xl">
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-5">
          {/* Timeseries */}
          <div className="h-44 rounded-lg border bg-background p-2 lg:col-span-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={DATA}
                margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="previewFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  interval={2}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} cursor={{ opacity: 0.08 }} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#previewFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Devices */}
          <div className="flex h-44 items-center gap-3 rounded-lg border bg-background p-3 lg:col-span-2">
            <div className="h-full w-20 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEVICES}
                    dataKey="value"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {DEVICES.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
              {DEVICES.map((d, i) => (
                <li key={d.name} className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i] }}
                  />
                  <d.icon className="size-3 shrink-0 text-muted-foreground" />
                  <span className="truncate text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium tabular-nums">{d.value}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Referrers */}
          <div className="space-y-2.5 rounded-lg border bg-background p-4 lg:col-span-2">
            <p className="text-xs font-medium">Top referrers</p>
            {REFERRERS.map((r) => (
              <div key={r.name} className="flex items-center gap-2 text-xs">
                <span className="w-24 shrink-0 truncate text-muted-foreground">
                  {r.name}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-1"
                    style={{ width: `${(r.pct / 40) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-medium tabular-nums">
                  {r.pct}%
                </span>
              </div>
            ))}
          </div>

          {/* Top link highlight */}
          <div className="flex items-center justify-between gap-3 rounded-lg border border-chart-3/30 bg-chart-3/10 p-4 lg:col-span-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Top link this month
              </p>
              <p className="mt-0.5 truncate font-mono text-sm font-semibold">
                /summer-launch
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold tabular-nums tracking-tight">
                12,847
              </p>
              <p className="text-[11px] text-muted-foreground">clicks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
