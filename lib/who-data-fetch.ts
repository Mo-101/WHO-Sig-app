import * as XLSX from "xlsx"

export interface WHOEvent {
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
}

const WHO_XLSX_URL = process.env.NEXT_PUBLIC_WHO_DATA_URL || "https://emergencydata.afro.who.int/data/latest.xlsx"

export async function fetchWHOData(): Promise<WHOEvent[]> {
  try {
    const response = await fetch(WHO_XLSX_URL)

    if (!response.ok) {
      throw new Error(`Failed to fetch WHO data: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })

    // Assuming first sheet contains the data
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet)

    // Map the xlsx data to our WHOEvent format
    const events: WHOEvent[] = jsonData.map((row: any, index: number) => ({
      id: row.id || `event-${index + 1}`,
      country: row.country || row.Country || "",
      lat: Number.parseFloat(row.latitude || row.lat || 0),
      lon: Number.parseFloat(row.longitude || row.lon || 0),
      disease: row.disease || row.Disease || "",
      grade: row.grade || row.Grade || "Ungraded",
      eventType: row.eventType || row["Event Type"] || "Outbreak",
      status: row.status || row.Status || "Ongoing",
      description: row.description || row.Description || "",
      year: Number.parseInt(row.year || row.Year || new Date().getFullYear()),
      reportDate: row.reportDate || row["Report Date"] || new Date().toISOString().split("T")[0],
      cases: Number.parseInt(row.cases || row.Cases || 0),
      deaths: Number.parseInt(row.deaths || row.Deaths || 0),
    }))

    return events.filter((event) => event.country && event.disease) // Filter out invalid entries
  } catch (error) {
    console.error("[v0] Error fetching WHO data from xlsx:", error)
    throw error
  }
}

// Cache the data with a timestamp
let cachedData: WHOEvent[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function getWHOData(): Promise<WHOEvent[]> {
  const now = Date.now()

  if (cachedData && now - cacheTimestamp < CACHE_DURATION) {
    return cachedData
  }

  cachedData = await fetchWHOData()
  cacheTimestamp = now

  return cachedData
}
