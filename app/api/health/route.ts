import { NextResponse } from "next/server"
import { checkDeploymentHealth } from "@/lib/deployment-check"
import { getWHOEventsFromDB } from "@/lib/db-config"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const health = await checkDeploymentHealth()

    let dbRecordCount = 0
    try {
      const events = await getWHOEventsFromDB()
      dbRecordCount = events.length
    } catch (error) {
      health.errors.push("Failed to query database: " + (error instanceof Error ? error.message : "Unknown error"))
    }

    health.databaseRecordCount = dbRecordCount

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json({
      errors: ["Failed to check deployment health: " + (error instanceof Error ? error.message : "Unknown error")],
    })
  }
}
