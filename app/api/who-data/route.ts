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

    let dataUrl = process.env.NEXT_PUBLIC_WHO_DATA_URL || ""

    if (dataUrl.includes("docs.google.com/spreadsheets")) {
      // Handle both regular spreadsheet URLs and published URLs
      if (dataUrl.includes("/d/e/")) {
        // Published URL format: /d/e/{SHEET_ID}
        const match = dataUrl.match(/\/d\/e\/([a-zA-Z0-9-_]+)/)
        if (match) {
          const sheetId = match[1]
          dataUrl = `https://docs.google.com/spreadsheets/d/e/${sheetId}/pub?output=xlsx`
          console.log(`[v0] Converted to published export URL: ${dataUrl}`)
        }
      } else if (dataUrl.includes("/d/")) {
        // Regular spreadsheet URL format: /d/{SHEET_ID}
        const match = dataUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
        if (match) {
          const sheetId = match[1]
          dataUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`
          console.log(`[v0] Converted to regular export URL: ${dataUrl}`)
        }
      }
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
      console.error(`[v0] Fetch failed with status: ${response.status}`)

      try {
        const dbEvents = await getWHOEventsFromDB()
        if (dbEvents.length > 0) {
          console.log(`[v0] Using cached database data: ${dbEvents.length} events`)
          return NextResponse.json({
            success: true,
            data: dbEvents,
            metadata: {
              totalEvents: dbEvents.length,
              fetchedAt: lastSync?.last_sync_time || new Date().toISOString(),
              source: "database-cache-fallback",
              warning: `Failed to fetch from remote source`,
            },
          })
        }
      } catch (dbError) {
        console.error("[v0] Database fallback failed:", dbError)
      }

      const { whoEvents } = await import("@/lib/who-data")
      console.log(`[v0] Using static fallback data: ${whoEvents.length} events`)
      return NextResponse.json({
        success: true,
        data: whoEvents,
        metadata: {
          totalEvents: whoEvents.length,
          sheets: ["fallback"],
          fetchedAt: new Date().toISOString(),
          source: "static-fallback",
        },
      })
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log(`[v0] Downloaded ${arrayBuffer.byteLength} bytes`)

    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    console.log(`[v0] Workbook sheets: ${workbook.SheetNames.join(", ")}`)

    const allEvents: WHOEvent[] = []
    let eventIdCounter = 1

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      console.log(`[v0] Sheet "${sheetName}" has ${jsonData.length} rows`)

      const sheetEvents: WHOEvent[] = jsonData
        .map((row: any, index: number) => {
          const id = row.id || row.ID || row.Id || `event-${eventIdCounter++}`
          const country =
            row.country || row.Country || row.COUNTRY || row.Country_Name || row["Country Name"] || row.Location || ""

          const latitude =
            row.latitude ||
            row.Latitude ||
            row.LATITUDE ||
            row.lat ||
            row.Lat ||
            row.LAT ||
            row.Latitude_Decimal ||
            row["Latitude (Decimal)"] ||
            0
          const longitude =
            row.longitude ||
            row.Longitude ||
            row.LONGITUDE ||
            row.lon ||
            row.Lon ||
            row.LON ||
            row.Longitude_Decimal ||
            row["Longitude (Decimal)"] ||
            0

          const disease =
            row.disease || row.Disease || row.DISEASE || row.Disease_Name || row["Disease Name"] || row.Pathogen || ""

          let grade =
            row.grade || row.Grade || row.GRADE || row.Grading || row["Grade Level"] || row.Risk_Level || "Ungraded"

          if (grade && typeof grade === "string") {
            if (grade.includes("3") || grade.toLowerCase().includes("three")) grade = "Grade 3"
            else if (grade.includes("2") || grade.toLowerCase().includes("two")) grade = "Grade 2"
            else if (grade.includes("1") || grade.toLowerCase().includes("one")) grade = "Grade 1"
            else if (
              grade.toLowerCase().includes("ungraded") ||
              grade.toLowerCase().includes("pending") ||
              grade.toLowerCase().includes("not graded")
            )
              grade = "Ungraded"
          }

          let eventType =
            row.eventType ||
            row["Event Type"] ||
            row.EVENT_TYPE ||
            row.Type ||
            row.Event_Type ||
            row.Category ||
            "Outbreak"

          const protracted =
            row.protracted ||
            row.Protracted ||
            row.PROTRACTED ||
            row.Protracted_Level ||
            row["Protracted Level"] ||
            row.Protracted_Type ||
            row["Protracted Type"]
          let protractedValue = null

          if (protracted) {
            protractedValue = protracted.toString()
            if (protracted.toString().includes("1")) {
              eventType = "Protracted-1"
              protractedValue = "Protracted-1"
            } else if (protracted.toString().includes("2")) {
              eventType = "Protracted-2"
              protractedValue = "Protracted-2"
            } else if (protracted.toString().includes("3")) {
              eventType = "Protracted-3"
              protractedValue = "Protracted-3"
            } else if (protracted.toString().toLowerCase().includes("protracted")) {
              eventType = "Protracted-1"
              protractedValue = "Protracted-1"
            }
          }

          const status = row.status || row.Status || row.STATUS || row.Event_Status || row["Event Status"] || "Ongoing"
          const description =
            row.description ||
            row.Description ||
            row.DESCRIPTION ||
            row.Details ||
            row.Summary ||
            row.Notes ||
            `${disease} outbreak in ${country}`

          const reportDate =
            row.reportDate ||
            row["Report Date"] ||
            row.REPORT_DATE ||
            row.Date ||
            row.date ||
            row.Report_Date ||
            row.Date_Reported ||
            new Date().toISOString().split("T")[0]

          let year = row.year || row.Year || row.YEAR
          if (!year && reportDate) {
            year = new Date(reportDate).getFullYear()
          }
          if (!year) {
            year = new Date().getFullYear()
          }

          const cases =
            row.cases ||
            row.Cases ||
            row.CASES ||
            row.Total_Cases ||
            row["Total Cases"] ||
            row.Case_Count ||
            row.Confirmed_Cases ||
            0
          const deaths =
            row.deaths ||
            row.Deaths ||
            row.DEATHS ||
            row.Total_Deaths ||
            row["Total Deaths"] ||
            row.Death_Count ||
            row.Fatalities ||
            0

          return {
            id: id.toString(),
            country: country.toString().trim(),
            lat: Number.parseFloat(latitude.toString()) || 0,
            lon: Number.parseFloat(longitude.toString()) || 0,
            disease: disease.toString().trim(),
            grade: grade.toString(),
            eventType: eventType.toString(),
            status: status.toString(),
            description: description.toString().trim(),
            year: Number.parseInt(year.toString()) || new Date().getFullYear(),
            reportDate: reportDate.toString(),
            cases: Number.parseInt(cases.toString()) || 0,
            deaths: Number.parseInt(deaths.toString()) || 0,
            protracted: protractedValue,
          }
        })
        .filter((event) => {
          return event.country && event.disease && event.country !== "" && event.disease !== ""
        })

      allEvents.push(...sheetEvents)
    }

    console.log(`[v0] Successfully parsed ${allEvents.length} total events from all sheets`)

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
          error: error instanceof Error ? error.message : "Unknown error occurred",
          data: [],
        },
        { status: 500 },
      )
    }
  }
}
