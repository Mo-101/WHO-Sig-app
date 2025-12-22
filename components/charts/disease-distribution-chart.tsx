"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { WHOEvent } from "@/lib/who-data"

interface DiseaseDistributionChartProps {
  events: WHOEvent[]
}

const COLORS = ["#009edb", "#ff3355", "#00c853", "#ff9933", "#8e44ad", "#ffcc00", "#3498db", "#e74c3c"]

export function DiseaseDistributionChart({ events }: DiseaseDistributionChartProps) {
  const chartData = useMemo(() => {
    const diseaseMap = new Map<string, number>()

    events.forEach((event) => {
      diseaseMap.set(event.disease, (diseaseMap.get(event.disease) || 0) + 1)
    })

    return Array.from(diseaseMap.entries())
      .map(([disease, count]) => ({ disease, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [events])

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1d9e6" />
          <XAxis dataKey="disease" tick={{ fontSize: 10, fill: "#6a7a94" }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 10, fill: "#6a7a94" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#e8eef5",
              border: "1px solid #d1d9e6",
              borderRadius: "8px",
              fontSize: "11px",
            }}
          />
          <Bar dataKey="count" name="Event Count" radius={[8, 8, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
