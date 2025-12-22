"use client"

import { useMemo } from "react"
import type { WHOEvent } from "@/lib/who-data"

interface CountryHeatmapProps {
  events: WHOEvent[]
}

export function CountryHeatmap({ events }: CountryHeatmapProps) {
  const countryData = useMemo(() => {
    const countryMap = new Map<string, { count: number; cases: number; deaths: number; grade3: number }>()

    events.forEach((event) => {
      const existing = countryMap.get(event.country) || { count: 0, cases: 0, deaths: 0, grade3: 0 }
      countryMap.set(event.country, {
        count: existing.count + 1,
        cases: existing.cases + (event.cases || 0),
        deaths: existing.deaths + (event.deaths || 0),
        grade3: existing.grade3 + (event.grade === "Grade 3" ? 1 : 0),
      })
    })

    return Array.from(countryMap.entries())
      .map(([country, data]) => ({ country, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  }, [events])

  const maxCount = Math.max(...countryData.map((d) => d.count), 1)

  const getIntensityColor = (count: number, grade3Count: number) => {
    const intensity = count / maxCount
    if (grade3Count > 0) {
      return `rgba(255, 51, 85, ${0.3 + intensity * 0.7})`
    }
    return `rgba(0, 158, 219, ${0.3 + intensity * 0.7})`
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-2">
        {countryData.map((data) => (
          <div
            key={data.country}
            className="p-3 rounded-lg transition-all hover:scale-105 cursor-pointer"
            style={{ backgroundColor: getIntensityColor(data.count, data.grade3) }}
          >
            <div className="text-[10px] font-bold text-white mb-1">{data.country}</div>
            <div className="text-xs text-white font-semibold">{data.count} events</div>
            <div className="text-[9px] text-white/90">
              {data.cases.toLocaleString()} cases • {data.deaths} deaths
            </div>
            {data.grade3 > 0 && <div className="text-[9px] text-white font-bold mt-1">⚠️ {data.grade3} Grade 3</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
