"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { WHOEvent } from "@/lib/who-data"

interface GradeSeverityChartProps {
  events: WHOEvent[]
}

const COLORS = {
  "Grade 3": "#ff3355",
  "Grade 2": "#ff9933",
  "Grade 1": "#ffcc00",
  Ungraded: "#a0a0b0",
}

export function GradeSeverityChart({ events }: GradeSeverityChartProps) {
  const chartData = useMemo(() => {
    const gradeMap = new Map<string, number>()

    events.forEach((event) => {
      gradeMap.set(event.grade, (gradeMap.get(event.grade) || 0) + 1)
    })

    return Array.from(gradeMap.entries()).map(([grade, count]) => ({
      name: grade,
      value: count,
      fill: COLORS[grade as keyof typeof COLORS] || "#a0a0b0",
    }))
  }, [events])

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#e8eef5",
              border: "1px solid #d1d9e6",
              borderRadius: "8px",
              fontSize: "11px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
