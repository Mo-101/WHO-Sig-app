"use client"

import { useState } from "react"
import { exportToPDF, exportToExcel, exportToCSV } from "@/lib/export-utils"
import { Download, FileText, Table, File } from "lucide-react"

interface ExportSectionProps {
  events: any[]
  filters: any
  isDark?: boolean
}

export function ExportSection({ events, filters, isDark = false }: ExportSectionProps) {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)

  const handleExport = async (type: "pdf" | "excel" | "csv") => {
    setExporting(true)
    setExportType(type)
    try {
      switch (type) {
        case "pdf":
          await exportToPDF(events, filters, {
            start: filters.startDate || "2025-01-01",
            end: filters.endDate || new Date().toISOString().split("T")[0],
          })
          break
        case "excel":
          exportToExcel(events, filters)
          break
        case "csv":
          exportToCSV(events)
          break
      }
    } catch (error) {
      console.error(`${type} export failed:`, error)
    } finally {
      setExporting(false)
      setExportType(null)
    }
  }

  const bgColor = isDark ? "bg-[#1a1f26]" : "bg-[#e8eef5]"
  const textColor = isDark ? "text-[#e2e8f0]" : "text-[#2c3e50]"
  const accentColor = isDark ? "text-[#3b82f6]" : "text-[#0056b3]"

  return (
    <div className={`${bgColor} rounded-2xl ${isDark ? "shadow-lg" : "neu-shadow"} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <Download className={`w-4 h-4 ${accentColor}`} />
        <h3 className={`text-xs font-bold ${accentColor} uppercase tracking-wide`}>Export Data</h3>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleExport("pdf")}
          disabled={exporting}
          className={`w-full ${bgColor} ${isDark ? "shadow-lg hover:shadow-xl" : "neu-shadow hover:shadow-md"} rounded-lg px-3 py-2.5 flex items-center justify-between transition-all ${exporting && exportType === "pdf" ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"}`}
        >
          <div className="flex items-center gap-2">
            <FileText className={`w-4 h-4 ${textColor}`} />
            <div className="text-left">
              <div className={`text-xs font-semibold ${textColor}`}>PDF Report</div>
              <div className={`text-[9px] ${isDark ? "text-[#94a3b8]" : "text-[#6a7a94]"}`}>
                Complete with executive summary
              </div>
            </div>
          </div>
          {exporting && exportType === "pdf" && (
            <div className="animate-spin h-4 w-4 border-2 border-[#009edb] border-t-transparent rounded-full" />
          )}
        </button>

        <button
          onClick={() => handleExport("excel")}
          disabled={exporting}
          className={`w-full ${bgColor} ${isDark ? "shadow-lg hover:shadow-xl" : "neu-shadow hover:shadow-md"} rounded-lg px-3 py-2.5 flex items-center justify-between transition-all ${exporting && exportType === "excel" ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"}`}
        >
          <div className="flex items-center gap-2">
            <Table className={`w-4 h-4 ${textColor}`} />
            <div className="text-left">
              <div className={`text-xs font-semibold ${textColor}`}>Excel Workbook</div>
              <div className={`text-[9px] ${isDark ? "text-[#94a3b8]" : "text-[#6a7a94]"}`}>
                Multiple sheets with analytics
              </div>
            </div>
          </div>
          {exporting && exportType === "excel" && (
            <div className="animate-spin h-4 w-4 border-2 border-[#009edb] border-t-transparent rounded-full" />
          )}
        </button>

        <button
          onClick={() => handleExport("csv")}
          disabled={exporting}
          className={`w-full ${bgColor} ${isDark ? "shadow-lg hover:shadow-xl" : "neu-shadow hover:shadow-md"} rounded-lg px-3 py-2.5 flex items-center justify-between transition-all ${exporting && exportType === "csv" ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"}`}
        >
          <div className="flex items-center gap-2">
            <File className={`w-4 h-4 ${textColor}`} />
            <div className="text-left">
              <div className={`text-xs font-semibold ${textColor}`}>CSV File</div>
              <div className={`text-[9px] ${isDark ? "text-[#94a3b8]" : "text-[#6a7a94]"}`}>Quick data export</div>
            </div>
          </div>
          {exporting && exportType === "csv" && (
            <div className="animate-spin h-4 w-4 border-2 border-[#009edb] border-t-transparent rounded-full" />
          )}
        </button>
      </div>

      <div className={`mt-3 p-2 rounded-lg ${isDark ? "bg-[#0f1419]" : "bg-white/40"}`}>
        <p className={`text-[9px] ${isDark ? "text-[#94a3b8]" : "text-[#6a7a94]"}`}>
          Exporting {events.length} events with current filters applied
        </p>
      </div>
    </div>
  )
}
