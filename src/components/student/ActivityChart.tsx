"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

export function ActivityChart({ data }: { data: { day: string; minutes: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} stroke="#E5E5EA" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A8A8E" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#8A8A8E" }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "#F5F5F7" }} contentStyle={{ borderRadius: 12, border: "1px solid #E5E5EA" }} />
        <Bar dataKey="minutes" fill="#5E5CE6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
