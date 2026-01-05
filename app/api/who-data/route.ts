import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { initializeDatabase, saveWHOEvents, getWHOEventsFromDB, getLastSyncMetadata } from "@/lib/db-config"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface WHOEvent {
  id: string
  country: string
  lat: number
  lon: number
  disease: string
  grade: string
  eventType: string
  status: string
  description: string
  year: number
  reportDate: string
  cases?: number
  deaths?: number
  protracted?: string
}

const PHE_SHEET_NAME = "PHE 20251023"
const SIGNAL_SHEET_NAME = "Signal Verification Sheet"
const RRA_SHEET_NAME = "RRA"
const EIS_SHEET_NAME = "EIS"
const GIS_SHEET_NAME = "GIS_AdminLevels"

type CountryLookup = Record<
  string,
  {
    name: string
    region?: string
    lat?: number
    lon?: number
  }
>

function buildCountryLookup(workbook: XLSX.WorkBook): CountryLookup {
  const lookup: CountryLookup = {}
  const gisSheet = workbook.Sheets[GIS_SHEET_NAME]

  if (!gisSheet) {
    console.warn(`[v0] GIS sheet "${GIS_SHEET_NAME}" not found. Country lookup will be limited.`)
    return lookup
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(gisSheet, {
    range: 1, // skip header row 0
    defval: "",
    raw: false,
  })

  rows.forEach((row) => {
    const iso3 = normalizeIso3(row["ISO_3_CODE"] || row["ISO_3_CODE_1"])
    if (!iso3) return

    if (!lookup[iso3]) {
      lookup[iso3] = {
        name: (row["ADM0_NAME"] || row["ADM0_NAME_1"] || "").toString() || iso3,
        region: (row["WHO_REGION"] || row["WHO_REGION_1"] || row["UNICEF_REG"])?.toString(),
        lat: parseNumber(row["CENTER_LAT"]),
        lon: parseNumber(row["CENTER_LON"]),
      }
    }
  })

  return lookup
}

function parsePheSheet(sheet: XLSX.WorkSheet | undefined, lookup: CountryLookup): WHOEvent[] {
  if (!sheet) {
    console.warn(`[v0] Sheet "${PHE_SHEET_NAME}" missing`)
    return []
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "", raw: false })
  const events: WHOEvent[] = []

  rows.forEach((row, index) => {
    const iso3 =
      normalizeIso3(row["ISO-Alpha-3"] || row["ISO Code"] || row["ISO3"]) || normalizeIso3(row.Country) || null
    if (!iso3) return

    const countryMeta = lookup[iso3]
    const coordinates = determineCoordinates(row, countryMeta)
    const reportDate =
      parseDate(row["Date of onset"]) ||
      parseDate(row["Date detected by MoH"]) ||
      parseDate(row["Date notified to WCO"]) ||
      parseDate(row["Date notified to AFRO"]) ||
      parseDate(row["EMS Create Date"]) ||
      new Date().toISOString()

    events.push({
      id: `PHE-${row["EMS No"] || index}`,
      country: (row.Country || countryMeta?.name || "").toString(),
      lat: coordinates.lat,
      lon: coordinates.lon,
      disease: (row.Event || "Unknown").toString(),
      grade: normalizeGrade(row.Grade),
      eventType: "PHE",
      status: normalizeStatus(row.Status),
      description: [row["Short comments"], row["Event notes"]].filter(Boolean).join(" | ") || "",
      year: new Date(reportDate).getFullYear(),
      reportDate,
      cases: parseIntSafe(row["Total cases"]),
      deaths: parseIntSafe(row.Deaths),
      protracted: undefined,
    })
  })

  return events
}

function parseSignalSheet(sheet: XLSX.WorkSheet | undefined, lookup: CountryLookup): WHOEvent[] {
  if (!sheet) {
    console.warn(`[v0] Sheet "${SIGNAL_SHEET_NAME}" missing`)
    return []
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "", raw: false })
  const events: WHOEvent[] = []

  rows.forEach((row, index) => {
    const iso3 = normalizeIso3(row["Country ISO3 Code"] || row.Country)
    if (!iso3) return

    const countryMeta = lookup[iso3]
    const coordinates = determineCoordinates(row, countryMeta)
    const reportDate =
      parseDate(row["Date of signal publication"]) ||
      parseDate(row["Date of detection"]) ||
      parseDate(row["Date verification request to the country"]) ||
      new Date().toISOString()

    events.push({
      id: `SIG-${index + 1}`,
      country: (row.Country || countryMeta?.name || "").toString(),
      lat: coordinates.lat,
      lon: coordinates.lon,
      disease: (row.Signal_name_recoded || row.Signal || "Signal").toString(),
      grade: normalizeSignalGrade(row),
      eventType: "Signal",
      status: row["EMS created"]?.toString().toLowerCase() === "yes" ? "Ongoing" : "New",
      description: [row.Observation, row.Comments, row.Source].filter(Boolean).join(" | ") || "",
      year: new Date(reportDate).getFullYear(),
      reportDate,
      cases: parseIntSafe(row.Case),
      deaths: parseIntSafe(row.Death),
      protracted: undefined,
    })
  })

  return events
}

function parseRraSheet(sheet: XLSX.WorkSheet | undefined, lookup: CountryLookup): WHOEvent[] {
  if (!sheet) {
    console.warn(`[v0] Sheet "${RRA_SHEET_NAME}" missing`)
    return []
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "", raw: false })
  const events: WHOEvent[] = []

  rows.forEach((row, index) => {
    const primaryCountry = row.Country?.toString().split(",")[0]?.trim()
    const iso3 =
      normalizeIso3(row["ISO_3_CODE"]) || normalizeIso3(primaryCountry || "") || normalizeIso3(row.Country)
    if (!iso3) return

    const countryMeta = lookup[iso3]
    const coordinates = determineCoordinates(row, countryMeta)
    const reportDate =
      parseDate(row.DecisionDate) || parseDate(row.EventCreated) || parseDate(row.FinalizedDate) || new Date().toISOString()

    events.push({
      id: `RRA-${row["Event ID"] || index}`,
      country: primaryCountry || countryMeta?.name || "Unknown",
      lat: coordinates.lat,
      lon: coordinates.lon,
      disease: (row["DiseaseCondition"] || row.Title || "Rapid Risk Assessment").toString(),
      grade: normalizeRiskLevel(row.NationalRiskLevel, row.RegionalRiskLevel),
      eventType: "RRA",
      status: row.NeedsGrading?.toString().toLowerCase() === "yes" ? "Monitoring" : "Ongoing",
      description: [row.Hazard, row.Syndrome, row.Aetiology].filter(Boolean).join(" | ") || "",
      year: new Date(reportDate).getFullYear(),
      reportDate,
      cases: 0,
      deaths: 0,
      protracted: undefined,
    })
  })

  return events
}

function parseEisSheet(sheet: XLSX.WorkSheet | undefined, lookup: CountryLookup): WHOEvent[] {
  if (!sheet) {
    console.warn(`[v0] Sheet "${EIS_SHEET_NAME}" missing`)
    return []
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "", raw: false })
  const events: WHOEvent[] = []

  rows.forEach((row, index) => {
    const iso3 = normalizeIso3(row.Country)
    if (!iso3) return

    const countryMeta = lookup[iso3]
    const coordinates = determineCoordinates(row, countryMeta)
    const reportDate =
      parseDate(row["Date published "]) ||
      parseDate(row["Date of EIS initiation"]) ||
      parseDate(row["Date finalised "]) ||
      new Date().toISOString()

    events.push({
      id: `EIS-${index + 1}`,
      country: (row.Country || countryMeta?.name || "").toString(),
      lat: coordinates.lat,
      lon: coordinates.lon,
      disease: (row.Events || "EIS Alert").toString(),
      grade: "Ungraded",
      eventType: "EIS",
      status: "Monitoring",
      description: row.Comments?.toString() || "",
      year: new Date(reportDate).getFullYear(),
      reportDate,
      cases: 0,
      deaths: 0,
      protracted: undefined,
    })
  })

  return events
}

function determineCoordinates(row: Record<string, any>, meta?: CountryLookup[string]) {
  const lat =
    parseNumber(row.lat) ||
    parseNumber(row.latitude) ||
    parseNumber(row.Latitude) ||
    meta?.lat ||
    0
  const lon =
    parseNumber(row.lon) ||
    parseNumber(row.longitude) ||
    parseNumber(row.Longitude) ||
    meta?.lon ||
    0

  return { lat, lon }
}

function normalizeIso3(value: any): string | null {
  if (!value) return null
  const iso = value.toString().trim().toUpperCase()
  if (iso.length === 3) return iso
  return null
}

function normalizeGrade(value: any): string {
  if (!value) return "Ungraded"
  const normalized = value.toString().toLowerCase()
  if (normalized.includes("3")) return "Grade 3"
  if (normalized.includes("2")) return "Grade 2"
  if (normalized.includes("1")) return "Grade 1"
  return "Ungraded"
}

function normalizeStatus(value: any): string {
  if (!value) return "Ongoing"
  const normalized = value.toString().toLowerCase()
  if (normalized.includes("closed") || normalized.includes("ended")) return "Closed"
  if (normalized.includes("monitor") || normalized.includes("watch")) return "Monitoring"
  return "Ongoing"
}

function normalizeSignalGrade(row: Record<string, any>): string {
  const classification = row["Final classification"]?.toString().toLowerCase() || ""
  const deaths = parseIntSafe(row.Death)
  if (classification.includes("confirm") || classification.includes("true")) {
    if (deaths >= 10) return "Grade 3"
    if (deaths >= 3) return "Grade 2"
    return "Grade 1"
  }
  return "Ungraded"
}

function normalizeRiskLevel(national?: any, regional?: any): string {
  const ranking = (value?: any) => {
    const text = value?.toString().toLowerCase() || ""
    if (text.includes("high") || text.includes("very high")) return 3
    if (text.includes("moderate") || text.includes("medium")) return 2
    if (text.includes("low")) return 1
    return 0
  }

  const score = Math.max(ranking(national), ranking(regional))
  if (score === 3) return "Grade 3"
  if (score === 2) return "Grade 2"
  if (score === 1) return "Grade 1"
  return "Ungraded"
}

function parseIntSafe(value: any): number {
  if (!value) return 0
  const number = Number.parseInt(value.toString().replace(/[^0-9.-]/g, ""), 10)
  return Number.isFinite(number) ? number : 0
}

function parseNumber(value: any): number | undefined {
  if (value === undefined || value === null || value === "") return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

function parseDate(value: any): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

let dbInitialized = false

export async function GET() {
  try {
    if (!dbInitialized) {
      console.log("[v0] Initializing database...")
      await initializeDatabase()
      dbInitialized = true
    }

    const lastSync = await getLastSyncMetadata()
    const shouldRefresh = !lastSync || Date.now() - new Date(lastSync.last_sync_time).getTime() > 5 * 60 * 1000 // 5 minutes

    if (!shouldRefresh && lastSync?.sync_status === "success") {
      console.log("[v0] Returning cached data from database")
      const cachedEvents = await getWHOEventsFromDB()

      if (cachedEvents.length === 0) {
        console.log("[v0] Database is empty, forcing refresh")
      } else {
        return NextResponse.json({
          success: true,
          data: cachedEvents,
          metadata: {
            totalEvents: cachedEvents.length,
            fetchedAt: lastSync.last_sync_time,
            source: "database-cache",
            cached: true,
          },
        })
      }
    }

    let dataUrl = process.env.NEXT_PUBLIC_WHO_DATA_URL || ""

    if (
      !dataUrl ||
      dataUrl ===
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-8N_ALP4IX8k7sFPRzdeALWNNeYpOMmGpbVC3V-nfAyvHsa0ZB6I2YFgONi4McA"
    ) {
      dataUrl =
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-8N_ALP4IX8k7sFPRzdeALWNNeYpOMmGpbVC3V-nfAyvHsa0ZB6I2YFgONi4McA/pub?output=xlsx"
      console.log("[v0] Using complete published URL")
    }

    console.log(`[v0] Fetching WHO data from: ${dataUrl}`)

    const response = await fetch(dataUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, */*",
      },
      cache: "no-store",
      redirect: "follow",
    })

    if (!response.ok) {
      console.warn(`[v0] Remote fetch returned ${response.status}, using database cache`)

      try {
        const dbEvents = await getWHOEventsFromDB()
        if (dbEvents.length > 0) {
          console.log(`[v0] Retrieved ${dbEvents.length} events from Azure PostgreSQL`)
          return NextResponse.json({
            success: true,
            data: dbEvents,
            metadata: {
              totalEvents: dbEvents.length,
              fetchedAt: lastSync?.last_sync_time || new Date().toISOString(),
              source: "database-cache-fallback",
              cached: true,
            },
          })
        }
      } catch (dbError) {
        console.warn("[v0] Database query issue:", dbError)
      }

      const { whoEvents } = await import("@/lib/who-data")

      try {
        await saveWHOEvents(whoEvents)
        console.log(`[v0] Saved static fallback data to database after error: ${whoEvents.length} events`)
      } catch (dbError) {
        console.error("[v0] Failed to save static fallback to database:", dbError)
      }

      console.warn(`[v0] Using static fallback after all errors: ${whoEvents.length} events`)
      return NextResponse.json({
        success: true,
        data: whoEvents,
        metadata: {
          totalEvents: whoEvents.length,
          sheets: ["fallback"],
          fetchedAt: new Date().toISOString(),
          source: "static-fallback",
          error: "Remote fetch failed",
        },
      })
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log(`[v0] Downloaded ${arrayBuffer.byteLength} bytes`)

    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    console.log(`[v0] Workbook sheets: ${workbook.SheetNames.join(", ")}`)

    const countryLookup = buildCountryLookup(workbook)
    console.log(`[v0] Loaded ${Object.keys(countryLookup).length} ISO3 country entries from GIS_AdminLevels`)

    const allEvents: WHOEvent[] = []

    allEvents.push(...parsePheSheet(workbook.Sheets[PHE_SHEET_NAME], countryLookup))
    allEvents.push(...parseSignalSheet(workbook.Sheets[SIGNAL_SHEET_NAME], countryLookup))
    allEvents.push(...parseRraSheet(workbook.Sheets[RRA_SHEET_NAME], countryLookup))
    allEvents.push(...parseEisSheet(workbook.Sheets[EIS_SHEET_NAME], countryLookup))

    console.log(
      `[v0] Aggregated events -> PHE:${allEvents.filter((e) => e.eventType === "PHE").length} | Signal:${
        allEvents.filter((e) => e.eventType === "Signal").length
      } | RRA:${allEvents.filter((e) => e.eventType === "RRA").length} | EIS:${
        allEvents.filter((e) => e.eventType === "EIS").length
      }`,
    )

    if (allEvents.length === 0) {
      throw new Error("No events could be parsed from the configured sheets.")
    }

    try {
      await saveWHOEvents(allEvents)
      console.log("[v0] Successfully saved events to PostgreSQL database")
    } catch (dbError) {
      console.error("[v0] Failed to save to database:", dbError)
    }

    return NextResponse.json(
      {
        success: true,
        data: allEvents,
        metadata: {
          totalEvents: allEvents.length,
          sheets: workbook.SheetNames,
          fetchedAt: new Date().toISOString(),
          source: dataUrl,
          cached: false,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error in WHO data API route:", error)

    try {
      const dbEvents = await getWHOEventsFromDB()
      if (dbEvents.length > 0) {
        console.warn(`[v0] Using database cache after error: ${dbEvents.length} events`)
        return NextResponse.json({
          success: true,
          data: dbEvents,
          metadata: {
            totalEvents: dbEvents.length,
            fetchedAt: new Date().toISOString(),
            source: "database-cache-error-fallback",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        })
      }
    } catch (dbError) {
      console.error("[v0] Database fallback also failed:", dbError)
    }

    try {
      const { whoEvents } = await import("@/lib/who-data")

      try {
        await saveWHOEvents(whoEvents)
        console.log(`[v0] Saved static fallback data to database after error: ${whoEvents.length} events`)
      } catch (dbError) {
        console.error("[v0] Failed to save static fallback to database:", dbError)
      }

      console.warn(`[v0] Using static fallback after all errors: ${whoEvents.length} events`)
      return NextResponse.json({
        success: true,
        data: whoEvents,
        metadata: {
          totalEvents: whoEvents.length,
          sheets: ["fallback"],
          fetchedAt: new Date().toISOString(),
          source: "static-fallback",
          error: error instanceof Error ? error.message : "Unknown error occurred",
        },
      })
    } catch (fallbackError) {
      return NextResponse.json(
        {
          success: false,
          error: "All data sources failed",
          data: [],
        },
        { status: 500 },
      )
    }
  }
}
