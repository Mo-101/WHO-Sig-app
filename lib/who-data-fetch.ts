import { z } from "zod"

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

// Zod schema for data validation
const WHOEventSchema = z.object({
  id: z.string(),
  country: z.string().min(2),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  disease: z.string().min(2),
  grade: z.enum(["Grade 3", "Grade 2", "Grade 1", "Ungraded"]),
  eventType: z.string(),
  status: z.string(),
  description: z.string(),
  year: z.number().min(2000).max(2100),
  reportDate: z.string(),
  cases: z.number().optional(),
  deaths: z.number().optional(),
})

export async function fetchWHOData(): Promise<WHOEvent[]> {
  try {
    console.log("[v0] Fetching WHO data from API route...")

    // Use API route to avoid CORS issues
    const response = await fetch("/api/who-data", {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(`Failed to fetch WHO data: ${errorData.error || response.statusText}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch WHO data")
    }

    const events = result.data as WHOEvent[]
    console.log(`[v0] Received ${events.length} events from API`)
    console.log(`[v0] Metadata:`, result.metadata)

    // Validate data
    const validatedEvents = events.map((event, index) => {
      try {
        return WHOEventSchema.parse(event)
      } catch (validationError) {
        console.warn(`[v0] Validation warning for event ${index}:`, validationError)
        // Return the event anyway but log the warning
        return event
      }
    })

    return validatedEvents
  } catch (error) {
    console.error("[v0] Error fetching WHO data:", error)

    // Attempt to load fallback static data
    console.warn("[v0] Attempting to load fallback static data...")
    try {
      const { whoEvents } = await import("./who-data")
      console.log(`[v0] Loaded ${whoEvents.length} events from fallback static data`)
      return whoEvents
    } catch (fallbackError) {
      console.error("[v0] Failed to load fallback data:", fallbackError)
      throw error // Re-throw original error
    }
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
