"use client"

import { Calendar } from "lucide-react"

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange }: DateRangePickerProps) {
  return (
    <div className="mb-4">
      <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-2">
        <Calendar className="inline w-3 h-3 mr-1" />
        Date Range
      </h3>
      <div className="space-y-2">
        <div>
          <label className="text-[9px] text-[#6a7a94] mb-1 block">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-[#e8eef5] neu-shadow-inset-sm text-xs text-[#2c3e50] border-none focus:outline-none focus:ring-1 focus:ring-[#009edb]"
          />
        </div>
        <div>
          <label className="text-[9px] text-[#6a7a94] mb-1 block">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-[#e8eef5] neu-shadow-inset-sm text-xs text-[#2c3e50] border-none focus:outline-none focus:ring-1 focus:ring-[#009edb]"
          />
        </div>
      </div>
    </div>
  )
}
