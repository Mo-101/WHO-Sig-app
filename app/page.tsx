"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import MapboxMap from "@/components/mapbox-map"
import { getWHOData, type WHOEvent } from "@/lib/who-data-fetch"
import { AIAlertPopup } from "@/components/ai-alert-popup"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIChatbot } from "@/components/ai-chatbot"
import { ExportSection } from "@/components/export-section"
import type { MapboxMapRef } from "@/components/mapbox-map"
import { AdvancedSearch } from "@/components/advanced-search"
import { FilterPresets } from "@/components/filter-presets"
import { DateRangePicker } from "@/components/date-range-picker"
import { NotificationCenter } from "@/components/notification-center"
import { EventDetailModal } from "@/components/event-detail-modal"
import { BarChart3 } from "lucide-react"
import Link from "next/link"
import { FilterBlock } from "@/components/filter-block"
import { GradeSummaryCard } from "@/components/grade-summary-card"

export default function Dashboard() {
  const [whoEvents, setWhoEvents] = useState<WHOEvent[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [dataError, setDataError] = useState<string | null>(null)
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
  const uniqueCountries = useMemo(() => Array.from(new Set(whoEvents.map((e) => e.country))).sort(), [whoEvents])
  const uniqueDiseases = useMemo(() => Array.from(new Set(whoEvents.map((e) => e.disease))).sort(), [whoEvents])
  const uniqueEventTypes = useMemo(() => Array.from(new Set(whoEvents.map((e) => e.eventType))).sort(), [whoEvents])
  const uniqueYears = useMemo(
    () => Array.from(new Set(whoEvents.map((e) => e.year))).sort((a, b) => b - a),
    [whoEvents],
  )

  const filteredEvents = useMemo(() => {
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
    return whoEvents.filter(
      (e) =>
        e.id !== event.id &&
        (e.country === event.country || e.disease === event.disease) &&
        Math.abs(new Date(e.reportDate).getTime() - new Date(event.reportDate).getTime()) < 30 * 24 * 60 * 60 * 1000,
    )
  }

  const gradeSummary = useMemo(() => {
    const g3 = whoEvents.filter((e) => e.grade === "Grade 3").length
    const g2 = whoEvents.filter((e) => e.grade === "Grade 2").length
    const g1 = whoEvents.filter((e) => e.grade === "Grade 1").length
    const gu = whoEvents.filter((e) => e.grade === "Ungraded").length
    return { g3, g2, g1, gu }
  }, [whoEvents])

  const newCount = filteredEvents.filter((e) => e.status === "New").length
  const ongoingCount = filteredEvents.filter((e) => e.status === "Ongoing").length
  const outbreakCount = filteredEvents.filter((e) => e.eventType === "Outbreak").length

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

  useEffect(() => {
    async function loadWHOData() {
      try {
        setIsLoadingData(true)
        setDataError(null)
        const data = await getWHOData()
        setWhoEvents(data)
        console.log(`[v0] Loaded ${data.length} events from WHO xlsx data source`)
      } catch (error) {
        console.error("[v0] Failed to load WHO data:", error)
        setDataError("Failed to load WHO outbreak data. Please check your connection.")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadWHOData()

    const refreshInterval = setInterval(loadWHOData, 5 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [])

  useEffect(() => {
    const checkForAnomaliesAndAlerts = async () => {
      if (whoEvents.length === 0) return

      try {
        console.log("[v0] AI monitoring active - analyzing WHO outbreak data...")

        // Analyze using WHO-trained AI system
        const { analyzeDataSourcesForAlerts } = await import("@/lib/ai-analysis")
        const analysis = await analyzeDataSourcesForAlerts(whoEvents)

        if (analysis.alertGenerated && analysis.alertLevel !== "info") {
          const newAlert = {
            id: crypto.randomUUID(),
            level: analysis.alertLevel,
            summary: analysis.summary,
            findings: analysis.findings,
            recommendations: analysis.recommendations,
            affectedCountries: analysis.affectedSources,
            timestamp: new Date(),
            riskScore: analysis.alertLevel === "critical" ? 95 : analysis.alertLevel === "high" ? 75 : 50,
          }

          setAlerts((prev) => {
            // Avoid duplicate alerts
            const exists = prev.some(
              (a) => a.summary === newAlert.summary && Date.now() - a.timestamp.getTime() < 300000, // 5 minutes
            )
            if (exists) return prev
            return [...prev, newAlert]
          })

          console.log("[v0] AI Alert Generated:", analysis.alertLevel, "-", analysis.summary)
        }
      } catch (error) {
        console.error("[v0] AI monitoring error:", error)
      }
    }

    // Run immediately
    checkForAnomaliesAndAlerts()

    // Check every 2 minutes
    const monitoringInterval = setInterval(checkForAnomaliesAndAlerts, 2 * 60 * 1000)

    return () => clearInterval(monitoringInterval)
  }, [whoEvents])

  if (isLoadingData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#ebfaff]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading WHO outbreak data...</p>
        </div>
      </div>
    )
  }

  if (dataError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#ebfaff]">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-3xl shadow-neu">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Data Load Error</h2>
          <p className="text-gray-600 mb-4">{dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition-neu"
          >
            Retry
          </button>
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

      <div className="fixed left-2.5 top-2.5 bottom-2.5 w-72 bg-surface rounded-neu shadow-neu p-5 overflow-y-auto custom-scrollbar z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-[#0056b3] flex items-center gap-2">
            <span className="text-lg">🎛️</span> FILTERS
          </h2>
        </div>

        <NotificationCenter events={filteredEvents} />

        <ExportSection events={filteredEvents} />

        <AdvancedSearch
          events={whoEvents}
          onSearchResults={(results) => {
            setSearchFilteredEvents(results)
          }}
        />

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
            className="w-full mb-4 px-4 py-2.5 bg-surface text-[#ff3355] text-xs font-bold rounded-pill shadow-neu-sm shadow-neu-hover shadow-neu-active transition-neu"
          >
            🗑️ Clear All Filters ({activeFilterCount})
          </button>
        )}

        <GradeSummaryCard summary={gradeSummary} />

        <FilterBlock
          title="Filter by Grade"
          icon="🎯"
          items={uniqueGrades}
          selectedItems={selectedGrades}
          onToggle={(value) => toggleFilter(value, selectedGrades, setSelectedGrades)}
        />

        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-base">📅</span> Year
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-neu input-neu text-xs text-[#2c3e50] font-medium border-none focus:outline-none focus:ring-2 focus:ring-[#009edb]"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <FilterBlock
          title="Event Type"
          icon="🚨"
          items={uniqueEventTypes}
          selectedItems={selectedEventTypes}
          onToggle={(value) => toggleFilter(value, selectedEventTypes, setSelectedEventTypes)}
        />

        <FilterBlock
          title="Country"
          icon="🌍"
          items={uniqueCountries}
          selectedItems={selectedCountries}
          onToggle={(value) => toggleFilter(value, selectedCountries, setSelectedCountries)}
        />

        <FilterBlock
          title="Disease"
          icon="🦠"
          items={uniqueDiseases}
          selectedItems={selectedDiseases}
          onToggle={(value) => toggleFilter(value, selectedDiseases, setSelectedDiseases)}
        />
      </div>

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
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl shadow-[4px_4px_12px_rgba(194,209,224,0.5),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div className="text-2xl font-bold text-[#009edb] leading-tight mb-0.5">{filteredEvents.length}</div>
            <div className="text-[9px] text-[#6a7a94] uppercase tracking-wide font-medium">Total Events</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-[4px_4px_12px_rgba(194,209,224,0.5),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div className="text-2xl font-bold text-[#00c853] leading-tight mb-0.5">{newCount}</div>
            <div className="text-[9px] text-[#6a7a94] uppercase tracking-wide font-medium">New Events</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-[4px_4px_12px_rgba(194,209,224,0.5),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <span className="text-xl">⏱️</span>
            </div>
            <div className="text-2xl font-bold text-[#ff9800] leading-tight mb-0.5">{ongoingCount}</div>
            <div className="text-[9px] text-[#6a7a94] uppercase tracking-wide font-medium">Ongoing</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-[4px_4px_12px_rgba(194,209,224,0.5),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <span className="text-xl">🚨</span>
            </div>
            <div className="text-2xl font-bold text-[#ff3355] leading-tight mb-0.5">{outbreakCount}</div>
            <div className="text-[9px] text-[#6a7a94] uppercase tracking-wide font-medium">Outbreaks</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl shadow-[4px_4px_12px_rgba(194,209,224,0.5),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
            <div className="text-2xl font-bold text-[#9c27b0] leading-tight mb-0.5">
              {filteredEvents.filter((e) => e.eventType === "Protracted 1").length}
            </div>
            <div className="text-[9px] text-[#6a7a94] uppercase tracking-wide font-medium">Protracted 1</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl shadow-[4px_4px_12px_rgba(194,209,224,0.5),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <span className="text-xl">⌛</span>
            </div>
            <div className="text-2xl font-bold text-[#e91e63] leading-tight mb-0.5">
              {filteredEvents.filter((e) => e.eventType === "Protracted 2").length}
            </div>
            <div className="text-[9px] text-[#6a7a94] uppercase tracking-wide font-medium">Protracted 2</div>
          </div>

          <div className="bg-[#ebfaff] rounded-3xl shadow-[8px_8px_16px_rgba(194,209,224,0.6),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(194,209,224,0.7),-12px_-12px_20px_rgba(255,255,255,0.9)] p-3 text-center transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl shadow-[4px_4px_12px_rgba(194,209,224,0.5),-4px_-4px_12px_rgba(255,255,255,0.8)] flex items-center justify-center">
              <span className="text-xl">🔄</span>
            </div>
            <div className="text-2xl font-bold text-[#3f51b5] leading-tight mb-0.5">
              {filteredEvents.filter((e) => e.eventType === "Protracted 3").length}
            </div>
            <div className="text-[9px] text-[#6a7a94] uppercase tracking-wide font-medium">Protracted 3</div>
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

      <aside className="fixed right-2.5 top-2.5 bottom-1.5 w-[260px] bg-[#ebfaff] rounded-3xl shadow-[10px_10px_15px_#c2d1e0,-10px_-10px_25px_#ffffff] p-4 overflow-hidden flex flex-col z-20 right-sidebar custom-scrollbar">
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
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#009edb] to-[#0056b3] flex items-center justify-center text-white text-base shadow-md overflow-hidden">
                  <img
                    src={`/${event.country}.png`}
                    alt={event.country}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="text-sm">${idx + 1}</span>`
                      }
                    }}
                  />
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
