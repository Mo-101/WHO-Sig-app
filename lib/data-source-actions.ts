"use server"

import { WHO_DATA_SOURCES } from "./data-sources"

// Function to check data source availability
export async function checkDataSourceStatus(sourceId: string) {
  const source = WHO_DATA_SOURCES.find((s) => s.id === sourceId)
  if (!source) return null

  try {
    const response = await fetch(source.url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    })

    return {
      sourceId: source.id,
      name: source.name,
      status: response.ok ? "online" : "offline",
      lastChecked: new Date(),
      statusCode: response.status,
    }
  } catch (error) {
    return {
      sourceId: source.id,
      name: source.name,
      status: "error",
      lastChecked: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Monitor all data sources
export async function monitorAllDataSources() {
  const statuses = await Promise.all(WHO_DATA_SOURCES.map((source) => checkDataSourceStatus(source.id)))

  return statuses.filter((status) => status !== null)
}
