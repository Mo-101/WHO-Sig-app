"use client"

import { useMemo } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { WHOEvent } from "@/lib/who-data"

interface OutbreakTrendsChartProps {
  events: WHOEvent[]
}

export function OutbreakTrendsChart({ events }: OutbreakTrendsChartProps) {
  const chartData = useMemo(() => {
    // Group by date
    const dateMap = new Map<string, { cases: number; deaths: number }>()

    events.forEach((event) => {
      const existing = dateMap.get(event.reportDate) || { cases: 0, deaths: 0 }
      dateMap.set(event.reportDate, {
        cases: existing.cases + (event.cases || 0),
        deaths: existing.deaths + (event.deaths || 0),
      })
    })

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cases: data.cases,
        deaths: data.deaths,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Last 14 days
  }, [events])

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d9e6" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6a7a94" }} />
          <YAxis tick={{ fontSize: 10, fill: "#6a7a94" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#e8eef5",
              border: "1px solid #d1d9e6",
              borderRadius: "8px",
              fontSize: "11px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          <Line
            type="monotone"
            dataKey="cases"
            stroke="#009edb"
            strokeWidth={2}
            name="Total Cases"
            dot={{ fill: "#009edb", r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="deaths"
            stroke="#ff3355"
            strokeWidth={2}
            name="Total Deaths"
            dot={{ fill: "#ff3355", r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
