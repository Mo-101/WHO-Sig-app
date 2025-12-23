"use client"

import { useState, useEffect } from "react"
import { Globe, AlertCircle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { WHO_DATA_SOURCES } from "@/lib/data-sources"

interface DataSourceStatus {
  sourceId: string
  name: string
  status: "online" | "offline" | "error"
  lastChecked: Date
  statusCode?: number
  error?: string
}

export function DataSourceMonitor() {
  const [statuses, setStatuses] = useState<DataSourceStatus[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const checkSources = async () => {
    setIsMonitoring(true)
    try {
      const statusChecks = await Promise.all(
        WHO_DATA_SOURCES.map(async (source) => {
          try {
            const response = await fetch(source.url, { method: "HEAD", mode: "no-cors" })
            return {
              sourceId: source.id,
              name: source.name,
              status: "online" as const,
              lastChecked: new Date(),
              statusCode: 200,
            }
          } catch (error) {
            return {
              sourceId: source.id,
              name: source.name,
              status: "error" as const,
              lastChecked: new Date(),
              error: "Unable to reach source",
            }
          }
        }),
      )

      setStatuses(statusChecks)
      setLastUpdate(new Date())
    } catch (error) {
      console.error("[v0] Error checking data sources:", error)
    } finally {
      setIsMonitoring(false)
    }
  }

  useEffect(() => {
    checkSources()
    const interval = setInterval(checkSources, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const onlineCount = statuses.filter((s) => s.status === "online").length
  const totalCount = WHO_DATA_SOURCES.length

  return (
    <div className="bg-[#e8eef5] rounded-lg neu-shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#009edb]" />
          <h4 className="text-xs font-semibold text-[#0056b3]">Data Sources</h4>
        </div>
        <button
          onClick={checkSources}
          disabled={isMonitoring}
          className="p-1 hover:bg-white/50 rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 text-[#009edb] ${isMonitoring ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between text-[10px] text-[#6a7a94] mb-1">
          <span>Status</span>
          <span>
            {onlineCount}/{totalCount} Online
          </span>
        </div>
        <div className="w-full bg-[#d1d9e6] rounded-full h-1.5">
          <div
            className="bg-gradient-to-r from-[#00c853] to-[#00e676] h-1.5 rounded-full transition-all"
            style={{ width: `${(onlineCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {WHO_DATA_SOURCES.map((source) => {
          const status = statuses.find((s) => s.sourceId === source.id)
          return (
            <div key={source.id} className="flex items-center gap-2 text-[10px] bg-white/30 rounded p-1.5">
              {status?.status === "online" ? (
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
              ) : status?.status === "offline" ? (
                <XCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-3 w-3 text-orange-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[#2c3e50] font-medium truncate">{source.name}</div>
                {source.priority === "critical" && (
                  <span className="text-[8px] text-red-500 font-semibold">CRITICAL</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 text-[9px] text-[#6a7a94] text-center">Last updated: {lastUpdate.toLocaleTimeString()}</div>
    </div>
  )
}
