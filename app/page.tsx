"use client"

import { useState, useMemo, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import MapboxMap from "@/components/mapbox-map"
import { whoEvents } from "@/lib/who-data"
import { AIAlertPopup } from "@/components/ai-alert-popup"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIChatbot } from "@/components/ai-chatbot"
import { ExportSection } from "@/components/export-section"
import { DataSourceMonitor } from "@/components/data-source-monitor"
import type { MapboxMapRef } from "@/components/mapbox-map"

export default function DashboardPage() {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([])
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(2025)
  const [alerts, setAlerts] = useState<any[]>([])
  const [selectedAlertCountries, setSelectedAlertCountries] = useState<string[]>([])
  const mapRef = useRef<MapboxMapRef>(null)
  const [selectedMapEvent, setSelectedMapEvent] = useState<any | null>(null)

  // Extract unique values
  const uniqueGrades = useMemo(() => ["Grade 3", "Grade 2", "Grade 1", "Ungraded"], [])
  const uniqueCountries = useMemo(() => Array.from(new Set(whoEvents.map((e) => e.country))).sort(), [])
  const uniqueDiseases = useMemo(() => Array.from(new Set(whoEvents.map((e) => e.disease))).sort(), [])
  const uniqueEventTypes = useMemo(() => Array.from(new Set(whoEvents.map((e) => e.eventType))).sort(), [])
  const uniqueYears = useMemo(() => Array.from(new Set(whoEvents.map((e) => e.year))).sort((a, b) => b - a), [])

  // Filter events
  const filteredEvents = useMemo(() => {
    return whoEvents.filter((event) => {
      const gradeMatch = selectedGrades.length === 0 || selectedGrades.includes(event.grade)
      const countryMatch = selectedCountries.length === 0 || selectedCountries.includes(event.country)
      const diseaseMatch = selectedDiseases.length === 0 || selectedDiseases.includes(event.disease)
      const eventTypeMatch = selectedEventTypes.length === 0 || selectedEventTypes.includes(event.eventType)
      const yearMatch = event.year === selectedYear
      return gradeMatch && countryMatch && diseaseMatch && eventTypeMatch && yearMatch
    })
  }, [selectedGrades, selectedCountries, selectedDiseases, selectedEventTypes, selectedYear])

  // Grade summary
  const gradeSummary = useMemo(() => {
    const g3 = whoEvents.filter((e) => e.grade === "Grade 3").length
    const g2 = whoEvents.filter((e) => e.grade === "Grade 2").length
    const g1 = whoEvents.filter((e) => e.grade === "Grade 1").length
    const gu = whoEvents.filter((e) => e.grade === "Ungraded").length
    return { g3, g2, g1, gu }
  }, [])

  const newCount = filteredEvents.filter((e) => e.status === "New").length
  const ongoingCount = filteredEvents.filter((e) => e.status === "Ongoing").length
  const outbreakCount = filteredEvents.filter((e) => e.eventType === "Outbreak").length

  const toggleFilter = (value: string, selectedValues: string[], setSelectedValues: (values: string[]) => void) => {
    setSelectedValues(
      selectedValues.includes(value) ? selectedValues.filter((v) => v !== value) : [...selectedValues, value],
    )
  }

  // useEffect(() => {
  //   const checkForAnomaliesAndDataSources = async () => {
  //     try {
  //       const alertAnalysis = await analyzeDataSourcesForAlerts(filteredEvents)

  //       if (alertAnalysis.alertGenerated) {
  //         const alert = {
  //           id: crypto.randomUUID(),
  //           alertLevel: alertAnalysis.alertLevel as "critical" | "high" | "medium" | "low",
  //           riskScore: alertAnalysis.alertLevel === "critical" ? 95 : alertAnalysis.alertLevel === "high" ? 85 : 70,
  //           summary: alertAnalysis.summary,
  //           keyFindings: alertAnalysis.findings,
  //           recommendations: alertAnalysis.recommendations,
  //           affectedCountries: Array.from(new Set(filteredEvents.map((e) => e.country))),
  //           trendAnalysis: alertAnalysis.estimatedImpact,
  //           timestamp: new Date(),
  //         }

  //         setAlerts((prev) => [...prev, alert])
  //       }
  //     } catch (error) {
  //       console.error("[v0] AI monitoring error:", error)
  //     }
  //   }

  //   checkForAnomaliesAndDataSources()

  //   const interval = setInterval(checkForAnomaliesAndDataSources, 120000)

  //   return () => clearInterval(interval)
  // }, [filteredEvents])

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
    if (mapRef.current) {
      mapRef.current.flyToLocation(event.lat, event.lon, 17, 45)
      setSelectedMapEvent(event)
      setSelectedCountries([event.country])
    }
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

  return (
    <div className="h-screen bg-[#e8eef5] font-sans overflow-hidden">
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

      {/* Left Sidebar */}
      <aside className="fixed left-2.5 top-2.5 bottom-2.5 w-[280px] bg-[#e8eef5] rounded-2xl neu-shadow p-4 overflow-y-auto z-20 custom-scrollbar">
        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-2">🎛️ Filter by Grade</h3>
          <div className="space-y-1.5">
            {uniqueGrades.map((grade) => (
              <div key={grade} className="flex items-center space-x-2">
                <Checkbox
                  id={`grade-${grade}`}
                  checked={selectedGrades.includes(grade)}
                  onCheckedChange={() => toggleFilter(grade, selectedGrades, setSelectedGrades)}
                  className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6]"
                />
                <Label htmlFor={`grade-${grade}`} className="text-xs text-[#2c3e50] cursor-pointer font-medium">
                  {grade}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-2">📅 Year</h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg bg-[#e8eef5] neu-shadow-inset-sm text-xs text-[#2c3e50] border-none focus:outline-none focus:ring-1 focus:ring-[#009edb]"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-2">🚨 Event Type</h3>
          <div className="space-y-1.5">
            {uniqueEventTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedEventTypes.includes(type)}
                  onCheckedChange={() => toggleFilter(type, selectedEventTypes, setSelectedEventTypes)}
                  className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6]"
                />
                <Label htmlFor={`type-${type}`} className="text-xs text-[#2c3e50] cursor-pointer font-medium">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-2">🌍 Country</h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {uniqueCountries.map((country) => (
              <div key={country} className="flex items-center space-x-2">
                <Checkbox
                  id={`country-${country}`}
                  checked={selectedCountries.includes(country)}
                  onCheckedChange={() => toggleFilter(country, selectedCountries, setSelectedCountries)}
                  className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6]"
                />
                <Label htmlFor={`country-${country}`} className="text-xs text-[#2c3e50] cursor-pointer font-medium">
                  {country}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-2">🦠 Disease</h3>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {uniqueDiseases.map((disease) => (
              <div key={disease} className="flex items-center space-x-2">
                <Checkbox
                  id={`disease-${disease}`}
                  checked={selectedDiseases.includes(disease)}
                  onCheckedChange={() => toggleFilter(disease, selectedDiseases, setSelectedDiseases)}
                  className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6]"
                />
                <Label
                  htmlFor={`disease-${disease}`}
                  className="text-xs text-[#2c3e50] cursor-pointer font-medium text-balance leading-tight"
                >
                  {disease}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Grade Summary */}
        <div>
          <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-2">📊 Grade Summary</h3>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-2.5 py-1.5 bg-[#e8eef5] rounded-lg neu-shadow-inset-sm border-l-[3px] border-[#ff3355]">
              <span className="text-[10px] text-[#6a7a94]">Grade 3</span>
              <span className="text-base font-bold text-[#2c3e50]">{gradeSummary.g3}</span>
            </div>
            <div className="flex justify-between items-center px-2.5 py-1.5 bg-[#e8eef5] rounded-lg neu-shadow-inset-sm border-l-[3px] border-[#ff9933]">
              <span className="text-[10px] text-[#6a7a94]">Grade 2</span>
              <span className="text-base font-bold text-[#2c3e50]">{gradeSummary.g2}</span>
            </div>
            <div className="flex justify-between items-center px-2.5 py-1.5 bg-[#e8eef5] rounded-lg neu-shadow-inset-sm border-l-[3px] border-[#ffcc00]">
              <span className="text-[10px] text-[#6a7a94]">Grade 1</span>
              <span className="text-base font-bold text-[#2c3e50]">{gradeSummary.g1}</span>
            </div>
            <div className="flex justify-between items-center px-2.5 py-1.5 bg-[#e8eef5] rounded-lg neu-shadow-inset-sm border-l-[3px] border-[#a0a0b0]">
              <span className="text-[10px] text-[#6a7a94]">Ungraded</span>
              <span className="text-base font-bold text-[#2c3e50]">{gradeSummary.gu}</span>
            </div>
          </div>
        </div>

        {/* Data Source Monitor */}
        <div className="mt-4">
          <DataSourceMonitor />
        </div>

        {/* Export Section */}
        <div className="mt-4">
          <ExportSection
            events={filteredEvents}
            filters={{ selectedGrades, selectedCountries, selectedDiseases, selectedEventTypes, selectedYear }}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[300px] mr-[300px] px-2.5 h-screen flex flex-col">
        {/* Header */}
        <header className="bg-[#e8eef5] rounded-2xl neu-shadow p-3 mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#2c3e50]">🌍 WHO Signal Intelligence Dashboard</h1>
            <p className="text-[11px] text-[#6a7a94]">Live tracking of graded events in the African region</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={false} />
            <span className="px-2.5 py-1 bg-gradient-to-r from-[#00c853] to-[#00e676] text-white text-[10px] font-semibold rounded-xl shadow-md">
              ● LIVE
            </span>
          </div>
        </header>

        <div className="mb-3 ticker-wrapper overflow-hidden">
          <div className="ticker-content">{tickerText}</div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="bg-[#e8eef5] rounded-2xl neu-shadow p-4 text-center">
            <div className="text-3xl font-bold text-[#009edb] leading-tight">{filteredEvents.length}</div>
            <div className="text-xs text-[#6a7a94] uppercase tracking-wide mt-1">Total Events</div>
          </div>
          <div className="bg-[#e8eef5] rounded-2xl neu-shadow p-4 text-center">
            <div className="text-3xl font-bold text-[#009edb] leading-tight">{newCount}</div>
            <div className="text-xs text-[#6a7a94] uppercase tracking-wide mt-1">New Events</div>
          </div>
          <div className="bg-[#e8eef5] rounded-2xl neu-shadow p-4 text-center">
            <div className="text-3xl font-bold text-[#009edb] leading-tight">{ongoingCount}</div>
            <div className="text-xs text-[#6a7a94] uppercase tracking-wide mt-1">Ongoing</div>
          </div>
          <div className="bg-[#e8eef5] rounded-2xl neu-shadow p-4 text-center">
            <div className="text-3xl font-bold text-[#009edb] leading-tight">{outbreakCount}</div>
            <div className="text-xs text-[#6a7a94] uppercase tracking-wide mt-1">Outbreaks</div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-[#e8eef5] rounded-2xl neu-shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-semibold text-[#0056b3] uppercase tracking-wide">📍 Event Distribution</h2>
            <div className="flex gap-3">
              <div className="flex items-center gap-1 text-[10px] text-[#6a7a94]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff3355]" />
                Grade 3
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#6a7a94]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff9933]" />
                Grade 2
              </div>
              <div className="flex items-center gap-1 text-[10px] text-[#6a7a94]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffcc00]" />
                Grade 1
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden h-[calc(100vh-280px)] min-h-[600px] relative">
            <MapboxMap
              ref={mapRef}
              events={filteredEvents}
              selectedEvent={selectedMapEvent}
              setSelectedEvent={setSelectedMapEvent}
            />
          </div>
        </div>
      </main>

      {/* Right Sidebar - Signal Feed */}
      <aside className="fixed right-2.5 top-2.5 bottom-2.5 w-[280px] bg-[#e8eef5] rounded-2xl neu-shadow p-4 overflow-hidden flex flex-col z-20 right-sidebar custom-scrollbar">
        <h3 className="text-xs font-bold text-[#0056b3] uppercase tracking-wide mb-3 pb-2 border-b-2 border-[#d1d9e6]">
          📡 Recent Signals
        </h3>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredEvents.slice(0, 20).map((event, idx) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event)}
              className="pb-3 border-b border-[#d1d9e6] last:border-none cursor-pointer hover:bg-white/50 rounded-lg p-2 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-2 mb-1">
                <div className="flex-shrink-0 w-8 h-8 rounded-full neu-shadow-sm overflow-hidden bg-white flex items-center justify-center">
                  <img
                    src={`/${event.country}.png`}
                    alt={`${event.country} flag`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to numbered badge if flag image doesn't exist
                      e.currentTarget.style.display = "none"
                      e.currentTarget.parentElement!.innerHTML =
                        `<div class="w-full h-full rounded-full bg-gradient-to-br from-[#009edb] to-[#0056b3] flex items-center justify-center text-white text-[10px] font-bold">${idx + 1}</div>`
                    }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#0056b3] uppercase">{event.country}</span>
              </div>
              <div className="ml-10 text-xs font-semibold text-[#2c3e50] mb-1">{event.disease}</div>
              <div className="ml-10 text-[9px] text-[#6a7a94] mb-1">
                {event.eventType} • {event.status}
              </div>
              <div className="ml-10 text-[10px] text-[#5a6a7a] leading-relaxed mb-1">{event.description}</div>
              <div
                className={`ml-10 inline-block text-[9px] px-2 py-0.5 rounded ${
                  event.grade === "Grade 3"
                    ? "bg-[#ff3355]/15 text-[#ff3355]"
                    : event.grade === "Grade 2"
                      ? "bg-[#ff9933]/15 text-[#ff9933]"
                      : event.grade === "Grade 1"
                        ? "bg-[#ffcc00]/15 text-[#cc9900]"
                        : "bg-[#a0a0b0]/15 text-[#6a7a94]"
                }`}
              >
                {event.grade}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
