import { NextResponse } from "next/server"
import * as XLSX from "xlsx"

export const dynamic = "force-dynamic" // Disable caching for fresh data
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
}

// Server-side data fetching to avoid CORS issues
export async function GET() {
  try {
    const dataUrl = process.env.NEXT_PUBLIC_WHO_DATA_URL || "https://emergencydata.afro.who.int/data/latest.xlsx"

    console.log(`[v0] Fetching WHO data from: ${dataUrl}`)

    const response = await fetch(dataUrl, {
      headers: {
        "User-Agent": "WHO-Signal-Intelligence-Dashboard/1.0",
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`[v0] Failed to fetch data: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Failed to fetch WHO data: ${response.statusText}`, status: response.status },
        { status: response.status },
      )
    }

    const contentType = response.headers.get("content-type")
    console.log(`[v0] Response content-type: ${contentType}`)

    const arrayBuffer = await response.arrayBuffer()
    console.log(`[v0] Received ${arrayBuffer.byteLength} bytes`)

    // Parse XLSX workbook
    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    console.log(`[v0] Workbook sheets: ${workbook.SheetNames.join(", ")}`)

    // Process all sheets and combine data
    const allEvents: WHOEvent[] = []
    let eventIdCounter = 1

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(sheet)

      console.log(`[v0] Sheet "${sheetName}" has ${jsonData.length} rows`)

      // Map each row to WHOEvent format
      const sheetEvents: WHOEvent[] = jsonData
        .map((row: any, index: number) => {
          // Try multiple possible column name variations
          const id = row.id || row.ID || row.Id || `event-${eventIdCounter++}`

          const country =
            row.country ||
            row.Country ||
            row.COUNTRY ||
            row.Country_Name ||
            row["Country Name"] ||
            row.Location ||
            ""

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
            row.disease ||
            row.Disease ||
            row.DISEASE ||
            row.Disease_Name ||
            row["Disease Name"] ||
            row.Pathogen ||
            ""

          let grade =
            row.grade ||
            row.Grade ||
            row.GRADE ||
            row.Grading ||
            row["Grade Level"] ||
            row.Risk_Level ||
            "Ungraded"

          // Normalize grade values
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

          // Check for Protracted events
          const protracted =
            row.protracted || row.Protracted || row.PROTRACTED || row.Protracted_Level || row["Protracted Level"]
          if (protracted) {
            if (protracted.toString().includes("1")) eventType = "Protracted-1"
            else if (protracted.toString().includes("2")) eventType = "Protracted-2"
            else if (protracted.toString().includes("3")) eventType = "Protracted-3"
            else if (protracted.toString().toLowerCase().includes("protracted")) eventType = "Protracted-1"
          }

          const status =
            row.status || row.Status || row.STATUS || row.Event_Status || row["Event Status"] || "Ongoing"

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
          }
        })
        .filter((event) => {
          // Filter out invalid entries (must have at least country and disease)
          return event.country && event.disease && event.country !== "" && event.disease !== ""
        })

      allEvents.push(...sheetEvents)
    }

    console.log(`[v0] Successfully parsed ${allEvents.length} total events from all sheets`)

    // Return data with metadata
    return NextResponse.json(
      {
        success: true,
        data: allEvents,
        metadata: {
          totalEvents: allEvents.length,
          sheets: workbook.SheetNames,
          fetchedAt: new Date().toISOString(),
          source: dataUrl,
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
