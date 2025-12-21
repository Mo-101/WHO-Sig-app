"use client"

import { useState } from "react"
import { exportToPDF, exportToExcel } from "@/lib/export-utils"

interface ExportSectionProps {
  events: any[]
  filters: any
  isDark?: boolean
}

export function ExportSection({ events, filters, isDark = false }: ExportSectionProps) {
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await exportToPDF(events, filters)
    } catch (error) {
      console.error("PDF export failed:", error)
    } finally {
      setExporting(false)
    }
  }

  const handleExportExcel = () => {
    setExporting(true)
    try {
      exportToExcel(events)
    } catch (error) {
      console.error("Excel export failed:", error)
    } finally {
      setExporting(false)
    }
  }

  const bgColor = isDark ? "bg-[#1a1f26]" : "bg-[#e8eef5]"
  const textColor = isDark ? "text-[#e2e8f0]" : "text-[#2c3e50]"
  const accentColor = isDark ? "text-[#3b82f6]" : "text-[#0056b3]"

  return (
    <div className={`${bgColor} rounded-2xl ${isDark ? "shadow-lg" : "neu-shadow"} p-4`}>
      <h3 className={`text-xs font-bold ${accentColor} uppercase tracking-wide mb-3`}>📥 Export Data</h3>
      <div className="flex gap-2">
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className={`flex-1 ${bgColor} ${isDark ? "shadow-lg hover:shadow-xl" : "neu-shadow hover:shadow-md"} rounded-xl px-4 py-3 flex flex-col items-center gap-2 transition-all ${exporting ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"}`}
        >
          <svg className={`w-6 h-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span className={`text-xs font-semibold ${textColor}`}>PDF Report</span>
        </button>

        <button
          onClick={handleExportExcel}
          disabled={exporting}
          className={`flex-1 ${bgColor} ${isDark ? "shadow-lg hover:shadow-xl" : "neu-shadow hover:shadow-md"} rounded-xl px-4 py-3 flex flex-col items-center gap-2 transition-all ${exporting ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] cursor-pointer"}`}
        >
          <svg className={`w-6 h-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <span className={`text-xs font-semibold ${textColor}`}>Excel Data</span>
        </button>
      </div>
    </div>
  )
}
