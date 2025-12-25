"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import useSWR from "swr"
import { Checkbox } from "@/components/ui/checkbox"
import MapboxMap from "@/components/mapbox-map"
import { AIAlertPopup } from "@/components/ai-alert-popup"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIChatbot } from "@/components/ai-chatbot"
import { ExportSection } from "@/components/export-section"
import { DataSourceMonitor } from "@/components/data-source-monitor"
import type { MapboxMapRef } from "@/components/mapbox-map"
import { AdvancedSearch } from "@/components/advanced-search"
import { FilterPresets } from "@/components/filter-presets"
import { DateRangePicker } from "@/components/date-range-picker"
import { NotificationCenter } from "@/components/notification-center"
import { EventDetailModal } from "@/components/event-detail-modal"
import { BarChart3, AlertTriangle, RefreshCw } from "lucide-react"
import Link from "next/link"
import { analyzeOutbreakData, detectAnomalies } from "@/lib/ai-analysis"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
  }
  const json = await res.json()
  console.log("[v0] API response received:", {
    success: json.success,
    dataLength: json.data?.length,
    source: json.metadata?.source,
  })

  // Handle structured API response
  if (json.success && Array.isArray(json.data)) {
    return json
  }

  // Fallback for legacy response format
  if (Array.isArray(json)) {
    return { success: true, data: json, metadata: { source: "legacy" } }
  }

  throw new Error("Invalid API response format")
}

export default function DashboardPage() {
  const {
    data: apiResponse,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/who-data", fetcher, {
    refreshInterval: 300000, // 5 minutes
    revalidateOnFocus: false,
    onSuccess: (data) => {
      console.log("[v0] Data loaded successfully:", data.data?.length, "events")
    },
    onError: (err) => {
      console.error("[v0] SWR Error:", err.message)
    },
  })

  const whoEvents = useMemo(() => {
    if (!apiResponse) return []
    if (Array.isArray(apiResponse.data)) return apiResponse.data
    return []
  }, [apiResponse])

  console.log("[v0] whoEvents array length:", whoEvents.length)

  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([])
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [alerts, setAlerts] = useState<any[]>([])
  const [selectedAlertCountries, setSelectedAlertCountries] = useState<string[]>([])
  const mapRef = useRef<MapboxMapRef>(null)
  const [selectedMapEvent, setSelectedMapEvent] = useState<any | null>(null)
  const [showCharts, setShowCharts] = useState(true)
  const [startDate, setStartDate] = useState("2025-12-01")
  const [endDate, setEndDate] = useState("2025-12-31")
  const [searchFilteredEvents, setSearchFilteredEvents] = useState<any[]>([])
  const [selectedEventForModal, setSelectedEventForModal] = useState<any | null>(null)

  const uniqueGrades = useMemo(() => ["Grade 3", "Grade 2", "Grade 1", "Ungraded"], [])
  const uniqueCountries = useMemo(
    () => Array.from(new Set((whoEvents || []).map((e) => e.country))).sort(),
    [whoEvents],
  )
  const uniqueDiseases = useMemo(() => Array.from(new Set((whoEvents || []).map((e) => e.disease))).sort(), [whoEvents])
  const uniqueEventTypes = useMemo(
    () => Array.from(new Set((whoEvents || []).map((e) => e.eventType))).sort(),
    [whoEvents],
  )
  const uniqueYears = useMemo(
    () => Array.from(new Set((whoEvents || []).map((e) => e.year))).sort((a, b) => b - a),
    [whoEvents],
  )

  const filteredEvents = useMemo(() => {
    if (!whoEvents) return []

    let events = whoEvents.filter((event) => {
      const gradeMatch = selectedGrades.length === 0 || selectedGrades.includes(event.grade)
      const countryMatch = selectedCountries.length === 0 || selectedCountries.includes(event.country)
      const diseaseMatch = selectedDiseases.length === 0 || selectedDiseases.includes(event.disease)
      const eventTypeMatch = selectedEventTypes.length === 0 || selectedEventTypes.includes(event.eventType)
      const yearMatch = event.year === selectedYear

      const eventDate = new Date(event.reportDate)
      const start = new Date(startDate)
      const end = new Date(endDate)
      const dateMatch = eventDate >= start && eventDate <= end

      return gradeMatch && countryMatch && diseaseMatch && eventTypeMatch && yearMatch && dateMatch
    })

    if (searchFilteredEvents.length > 0) {
      const searchIds = new Set(searchFilteredEvents.map((e) => e.id))
      events = events.filter((e) => searchIds.has(e.id))
    }

    return events
  }, [
    whoEvents,
    selectedGrades,
    selectedCountries,
    selectedDiseases,
    selectedEventTypes,
    selectedYear,
    startDate,
    endDate,
    searchFilteredEvents,
  ])

  const getRelatedEvents = (event: any) => {
    if (!whoEvents) return []
    return whoEvents.filter(
      (e) =>
        e.id !== event.id &&
        (e.country === event.country || e.disease === event.disease) &&
        Math.abs(new Date(e.reportDate).getTime() - new Date(event.reportDate).getTime()) < 30 * 24 * 60 * 60 * 1000,
    )
  }

  const gradeSummary = useMemo(() => {
    if (!whoEvents) return { g3: 0, g2: 0, g1: 0, gu: 0 }
    const g3 = whoEvents.filter((e) => e.grade === "Grade 3").length
    const g2 = whoEvents.filter((e) => e.grade === "Grade 2").length
    const g1 = whoEvents.filter((e) => e.grade === "Grade 1").length
    const gu = whoEvents.filter((e) => e.grade === "Ungraded").length
    return { g3, g2, g1, gu }
  }, [whoEvents])

  const newCount = filteredEvents.filter((e) => e.status === "New").length
  const ongoingCount = filteredEvents.filter((e) => e.status === "Ongoing").length
  const outbreakCount = filteredEvents.filter((e) => e.eventType === "Outbreak").length

  const protracted1Count = (whoEvents || []).filter((e) => e.eventType.includes("Protracted-1")).length
  const protracted2Count = (whoEvents || []).filter((e) => e.eventType.includes("Protracted-2")).length
  const protracted3Count = (whoEvents || []).filter((e) => e.eventType.includes("Protracted-3")).length

  const toggleFilter = (value: string, selectedValues: string[], setSelectedValues: (values: string[]) => void) => {
    setSelectedValues(
      selectedValues.includes(value) ? selectedValues.filter((v) => v !== value) : [...selectedValues, value],
    )
  }

  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId))
  }

  const handleAlertViewDetails = (alert: any) => {
    setSelectedAlertCountries(alert.affectedCountries)
    document.querySelector(".right-sidebar")?.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAlertJumpToLocation = (countries: string[]) => {
    setSelectedCountries(countries)
  }

  const handleEventClick = (event: any) => {
    setSelectedEventForModal(event)
  }

  const handleModalJumpToLocation = (event: any) => {
    if (mapRef.current) {
      mapRef.current.flyToLocation(event.lat, event.lon, 17, 45)
      setSelectedMapEvent(event)
      setSelectedCountries([event.country])
    }
    setSelectedEventForModal(null)
  }

  const tickerEvents = useMemo(() => {
    return filteredEvents.slice(0, 8).map((event) => ({
      country: event.country,
      disease: event.disease,
      grade: event.grade,
    }))
  }, [filteredEvents])

  const tickerText = useMemo(() => {
    const items = tickerEvents.map((e) => `🔴 ${e.country}: ${e.disease} (${e.grade})`)
    const combined = items.join("  •  ")
    return `LIVE UPDATES: ${combined}  •  ${combined}`
  }, [tickerEvents])

  const handleApplyPreset = (preset: any) => {
    setSelectedGrades(preset.filters.grades)
    setSelectedCountries(preset.filters.countries)
    setSelectedDiseases(preset.filters.diseases)
    setSelectedEventTypes(preset.filters.eventTypes)
    setSelectedYear(preset.filters.year)
  }

  const handleClearFilters = () => {
    setSelectedGrades([])
    setSelectedCountries([])
    setSelectedDiseases([])
    setSelectedEventTypes([])
    setSearchFilteredEvents([])
  }

  const activeFilterCount = useMemo(() => {
    return (
      selectedGrades.length +
      selectedCountries.length +
      selectedDiseases.length +
      selectedEventTypes.length +
      (searchFilteredEvents.length > 0 ? 1 : 0)
    )
  }, [selectedGrades, selectedCountries, selectedDiseases, selectedEventTypes, searchFilteredEvents])

  const handleManualRefresh = () => {
    mutate()
  }

  useEffect(() => {
    const runAIAnalysis = async () => {
      if (whoEvents.length === 0) return

      try {
        console.log("[v0] Running AI analysis on", whoEvents.length, "events")

        // Run AI analysis
        const analysis = await analyzeOutbreakData(whoEvents)
        const anomalies = await detectAnomalies(whoEvents)

        console.log("[v0] AI Analysis complete:", { analysis, anomalies })

        // Generate alerts if needed
        if (anomalies.anomalyDetected || analysis.alertLevel === "critical" || analysis.alertLevel === "high") {
          const newAlert = {
            id: crypto.randomUUID(),
            type: analysis.alertLevel === "critical" ? "critical" : "warning",
            title: `${analysis.alertLevel.toUpperCase()} Alert: ${anomalies.anomalyDetected ? anomalies.anomalyType : "Risk Assessment"}`,
            summary: analysis.summary,
            affectedCountries: analysis.affectedCountries,
            recommendations: analysis.recommendations,
            riskScore: analysis.riskScore,
            timestamp: new Date(),
          }

          setAlerts((prev) => {
            // Avoid duplicate alerts
            const exists = prev.some((a) => a.title === newAlert.title && Date.now() - a.timestamp.getTime() < 600000)
            if (!exists) {
              console.log("[v0] New alert generated:", newAlert)
              return [newAlert, ...prev].slice(0, 5) // Keep max 5 alerts
            }
            return prev
          })
        }
      } catch (error) {
        console.error("[v0] AI analysis error:", error)
      }
    }

    // Run analysis on load and every 5 minutes
    runAIAnalysis()
    const interval = setInterval(runAIAnalysis, 300000)
    return () => clearInterval(interval)
  }, [whoEvents])

  if (isLoading) {
    return (
      <div className="h-screen bg-[#ebfaff] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-[#009edb] animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-[#2c3e50]">Loading WHO Data...</p>
          <p className="text-sm text-[#6a7a94] mt-2">Fetching latest outbreak information</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-[#ebfaff] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-[#ff3355] mx-auto mb-4" />
          <p className="text-lg font-semibold text-[#2c3e50] mb-2">Failed to Load Data</p>
          <p className="text-sm text-[#6a7a94] mb-4">
            {error.message || "Unable to fetch WHO data. Please try again."}
          </p>
          <button
            onClick={handleManualRefresh}
            className="px-6 py-3 bg-[#009edb] text-white font-semibold rounded-xl hover:bg-[#0056b3] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!whoEvents || whoEvents.length === 0) {
    return (
      <div className="h-screen bg-[#ebfaff] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-[#2c3e50]">No Data Available</p>
          <p className="text-sm text-[#6a7a94] mt-2">No outbreak events found in the database</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#ebfaff] font-sans overflow-hidden">
      {alerts.map((alert) => (
        <AIAlertPopup
          key={alert.id}
          alert={alert}
          onDismiss={() => handleDismissAlert(alert.id)}
          onViewDetails={handleAlertViewDetails}
          onJumpToLocation={handleAlertJumpToLocation}
        />
      ))}

      <AIChatbot events={filteredEvents} />

      {selectedEventForModal && (
        <EventDetailModal
          event={selectedEventForModal}
          relatedEvents={getRelatedEvents(selectedEventForModal)}
          onClose={() => setSelectedEventForModal(null)}
          onJumpToLocation={handleModalJumpToLocation}
        />
      )}

      <aside className="fixed left-2.5 top-2.5 bottom-2.5 w-[280px] bg-[#ebfaff] rounded-3xl shadow-[10px_10px_25px_#c2d1e0,-10px_-10px_25px_#ffffff] p-4 overflow-y-auto z-20 custom-scrollbar">
        <AdvancedSearch events={whoEvents} onSearchResults={setSearchFilteredEvents} />

        <FilterPresets
          currentFilters={{
            selectedGrades,
            selectedCountries,
            selectedDiseases,
            selectedEventTypes,
            selectedYear,
          }}
          onApplyPreset={handleApplyPreset}
        />

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="w-full mb-4 px-4 py-2.5 bg-[#ebfaff] text-[#ff3355] text-xs font-bold rounded-xl shadow-[6px_6px_12px_#c2d1e0,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#c2d1e0,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c2d1e0,inset_-4px_-4px_8px_#ffffff] transition-all"
          >
            🗑️ Clear All Filters ({activeFilterCount})
          </button>
        )}

        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-base">🎛️</span> Filter by Grade
          </h3>
          <div className="space-y-2">
            {uniqueGrades.map((grade) => (
              <label
                key={grade}
                className="flex items-center space-x-3 p-2.5 bg-[#ebfaff] rounded-xl shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] cursor-pointer transition-all"
              >
                <Checkbox
                  id={`grade-${grade}`}
                  checked={selectedGrades.includes(grade)}
                  onCheckedChange={() => toggleFilter(grade, selectedGrades, setSelectedGrades)}
                  className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6]"
                />
                <span className="text-xs text-[#2c3e50] font-medium flex-1">{grade}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-base">📅</span> Year
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl bg-[#ebfaff] shadow-[inset_4px_4px_10px_#c2d1e0,inset_-4px_-4px_10px_#ffffff] text-xs text-[#2c3e50] font-medium border-none focus:outline-none focus:ring-2 focus:ring-[#009edb]"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-base">🚨</span> Event Type
          </h3>
          <div className="space-y-2">
            {uniqueEventTypes.map((type) => (
              <label
                key={type}
                className="flex items-center space-x-3 p-2.5 bg-[#ebfaff] rounded-xl shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] cursor-pointer transition-all"
              >
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedEventTypes.includes(type)}
                  onCheckedChange={() => toggleFilter(type, selectedEventTypes, setSelectedEventTypes)}
                  className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6]"
                />
                <span className="text-xs text-[#2c3e50] font-medium flex-1">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-base">🌍</span> Country
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {uniqueCountries.map((country) => (
              <label
                key={country}
                className="flex items-center space-x-3 p-2.5 bg-[#ebfaff] rounded-xl shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] cursor-pointer transition-all"
              >
                <Checkbox
                  id={`country-${country}`}
                  checked={selectedCountries.includes(country)}
                  onCheckedChange={() => toggleFilter(country, selectedCountries, setSelectedCountries)}
                  className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6]"
                />
                <span className="text-xs text-[#2c3e50] font-medium flex-1">{country}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-base">🦠</span> Disease
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {uniqueDiseases.map((disease) => (
              <label
                key={disease}
                className="flex items-center space-x-3 p-2.5 bg-[#ebfaff] rounded-xl shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] cursor-pointer transition-all"
              >
                <Checkbox
                  id={`disease-${disease}`}
                  checked={selectedDiseases.includes(disease)}
                  onCheckedChange={() => toggleFilter(disease, selectedDiseases, setSelectedDiseases)}
                  className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6]"
                />
                <span className="text-xs text-[#2c3e50] font-medium flex-1 text-balance leading-tight">{disease}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-base">📊</span> Grade Summary
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-4 py-3 bg-[#ebfaff] rounded-xl shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] border-l-4 border-[#ff3355]">
              <span className="text-xs font-medium text-[#6a7a94]">Grade 3</span>
              <span className="text-lg font-bold text-[#2c3e50]">{gradeSummary.g3}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#ebfaff] rounded-xl shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] border-l-4 border-[#ff9933]">
              <span className="text-xs font-medium text-[#6a7a94]">Grade 2</span>
              <span className="text-lg font-bold text-[#2c3e50]">{gradeSummary.g2}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#ebfaff] rounded-xl shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] border-l-4 border-[#ffcc00]">
              <span className="text-xs font-medium text-[#6a7a94]">Grade 1</span>
              <span className="text-lg font-bold text-[#2c3e50]">{gradeSummary.g1}</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-[#ebfaff] rounded-xl shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] border-l-4 border-[#a0a0b0]">
              <span className="text-xs font-medium text-[#6a7a94]">Ungraded</span>
              <span className="text-lg font-bold text-[#2c3e50]">{gradeSummary.gu}</span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <DataSourceMonitor />
        </div>

        <div className="mt-4">
          <ExportSection
            events={filteredEvents}
            filters={{ selectedGrades, selectedCountries, selectedDiseases, selectedEventTypes, selectedYear }}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[300px] mr-[300px] px-2.5 h-screen flex flex-col">
        <header className="bg-[#ebfaff] rounded-3xl shadow-[10px_10px_25px_#c2d1e0,-10px_-10px_25px_#ffffff] p-4 mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#2c3e50]">🌍 WHO Signal Intelligence Dashboard</h1>
            <p className="text-[11px] text-[#6a7a94]">Live tracking of graded events in the African region</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/analytics"
              className="bg-[#ebfaff] p-2.5 rounded-xl shadow-[6px_6px_12px_#c2d1e0,-6px_-6px_12px_#ffffff] hover:shadow-[4px_4px_8px_#c2d1e0,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#c2d1e0,inset_-4px_-4px_8px_#ffffff] transition-all"
              title="View Analytics"
            >
              <BarChart3 className="w-5 h-5 text-[#0056b3]" />
            </Link>
            <NotificationCenter events={filteredEvents} />
            <ThemeToggle isDark={false} />
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#00c853] to-[#00e676] text-white text-[10px] font-semibold rounded-xl shadow-md">
              ● LIVE
            </span>
          </div>
        </header>

        <div className="mb-3 ticker-wrapper shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff]">
          <div className="ticker-content">{tickerText}</div>
        </div>

        <div className="grid grid-cols-7 gap-3 mb-3">
          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#ebfaff] shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] p-0.5 flex items-center justify-center overflow-hidden">
              <img src="/Total events.gif" alt="Total Events" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-2xl font-bold text-[#009edb] leading-tight mb-0.5">{filteredEvents.length}</div>
            <div className="text-[10px] text-[#6a7a94] uppercase tracking-wide font-medium">Total Events</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#ebfaff] shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] p-0.5 flex items-center justify-center overflow-hidden">
              <img src="/New events.gif" alt="New Events" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-2xl font-bold text-[#00c853] leading-tight mb-0.5">{newCount}</div>
            <div className="text-[10px] text-[#6a7a94] uppercase tracking-wide font-medium">New Events</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#ebfaff] shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] p-0.5 flex items-center justify-center overflow-hidden">
              <img src="/ongoing.gif" alt="Ongoing" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-2xl font-bold text-[#ff9800] leading-tight mb-0.5">{ongoingCount}</div>
            <div className="text-[10px] text-[#6a7a94] uppercase tracking-wide font-medium">Ongoing</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#ebfaff] shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] p-0.5 flex items-center justify-center overflow-hidden">
              <img src="/outbreak.gif" alt="Outbreaks" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-2xl font-bold text-[#ff3355] leading-tight mb-0.5">{outbreakCount}</div>
            <div className="text-[10px] text-[#6a7a94] uppercase tracking-wide font-medium">Outbreaks</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#ebfaff] shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] p-0.5 flex items-center justify-center overflow-hidden">
              <img src="/Protracted-1.gif" alt="Protracted-1" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-2xl font-bold text-[#9c27b0] leading-tight mb-0.5">{protracted1Count}</div>
            <div className="text-[10px] text-[#6a7a94] uppercase tracking-wide font-medium">Protracted-1</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#ebfaff] shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] p-0.5 flex items-center justify-center overflow-hidden">
              <img src="/Protracted-2.gif" alt="Protracted-2" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-2xl font-bold text-[#3f51b5] leading-tight mb-0.5">{protracted2Count}</div>
            <div className="text-[10px] text-[#6a7a94] uppercase tracking-wide font-medium">Protracted-2</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#ebfaff] shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] p-0.5 flex items-center justify-center overflow-hidden">
              <img src="/Protracted-3.gif" alt="Protracted-3" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-2xl font-bold text-[#e91e63] leading-tight mb-0.5">{protracted3Count}</div>
            <div className="text-[10px] text-[#6a7a94] uppercase tracking-wide font-medium">Protracted-3</div>
          </div>
        </div>

        <div
          className="bg-[#ebfaff] rounded-3xl shadow-[10px_10px_25px_#c2d1e0,-10px_-10px_25px_#ffffff] overflow-hidden relative"
          style={{ height: "calc(100vh - 250px)" }}
        >
          <MapboxMap
            ref={mapRef}
            events={filteredEvents}
            selectedEvent={selectedMapEvent}
            setSelectedEvent={setSelectedMapEvent}
          />
        </div>
      </main>

      <aside className="fixed right-2.5 top-2.5 bottom-2.5 w-[280px] bg-[#ebfaff] rounded-3xl shadow-[10px_10px_25px_#c2d1e0,-10px_-10px_25px_#ffffff] p-4 overflow-hidden flex flex-col z-20 right-sidebar custom-scrollbar">
        <h3 className="text-xs font-bold text-[#0056b3] uppercase tracking-wide mb-3 pb-2 border-b-2 border-[#d1d9e6] flex items-center gap-2">
          <span className="text-base">📡</span> Recent Signals
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredEvents.slice(0, 20).map((event, idx) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="p-3 bg-[#ebfaff] rounded-2xl shadow-[6px_6px_14px_#c2d1e0,-6px_-6px_14px_#ffffff] hover:shadow-[8px_8px_18px_#c2d1e0,-8px_-8px_18px_#ffffff] cursor-pointer transition-all"
            >
              <div className="flex items-start gap-3 mb-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#ebfaff] shadow-[4px_4px_10px_#c2d1e0,-4px_-4px_10px_#ffffff] flex items-center justify-center p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                    <img
                      src={`/${event.country}.png`}
                      alt={`${event.country} flag`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        e.currentTarget.parentElement!.innerHTML =
                          `<span class="text-[#0056b3] text-xs font-bold">${event.country.substring(0, 2).toUpperCase()}</span>`
                      }}
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#0056b3] uppercase truncate">{event.country}</div>
                  <div className="text-[10px] text-[#6a7a94]">#{idx + 1}</div>
                </div>
              </div>
              <div className="text-xs font-semibold text-[#2c3e50] mb-1">{event.disease}</div>
              <div className="text-[9px] text-[#6a7a94] mb-1">
                {event.eventType} • {event.status}
              </div>
              <div className="text-[10px] text-[#5a6a7a] leading-relaxed mb-2 line-clamp-2">{event.description}</div>
              <div className="flex items-center justify-between">
                <div
                  className={`inline-block text-[9px] px-2.5 py-1 rounded-lg font-semibold ${
                    event.grade === "Grade 3"
                      ? "bg-[#ff3355]/20 text-[#ff3355]"
                      : event.grade === "Grade 2"
                        ? "bg-[#ff9933]/20 text-[#ff9933]"
                        : event.grade === "Grade 1"
                          ? "bg-[#ffcc00]/20 text-[#ffcc00]"
                          : "bg-[#a0a0b0]/20 text-[#a0a0b0]"
                  }`}
                >
                  {event.grade}
                </div>
                <div className="text-[9px] text-[#6a7a94]">{new Date(event.reportDate).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
