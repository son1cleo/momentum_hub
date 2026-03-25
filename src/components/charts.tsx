"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeeklyChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="mb-4 text-sm font-semibold text-zinc-200">Weekly Completions</p>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30333a" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
          <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
          <Tooltip cursor={{ fill: "#17191f" }} />
          <Bar dataKey="value" fill="#9ca3af" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <div className="h-64 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="mb-4 text-sm font-semibold text-zinc-200">Monthly Completions</p>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30333a" />
          <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
          <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
          <Tooltip cursor={{ fill: "#17191f" }} />
          <Bar dataKey="value" fill="#d4d4d8" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
