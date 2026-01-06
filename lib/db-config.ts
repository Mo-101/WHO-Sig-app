// Database functionality completely disabled
// Using static fallback data only

let loggedMissingEnv = false

export async function initializeDatabase() {
  if (!loggedMissingEnv) {
    console.warn("[v0] Database disabled - application using static/fetched data only")
    loggedMissingEnv = true
  }
  return
}

export async function saveWHOEvents(events: any[]) {
  // Database disabled - data not persisted
  return false
}

export async function getWHOEventsFromDB() {
  // Database disabled - returning empty array
  return []
}

export async function getLastSyncMetadata() {
  // Database disabled - no sync metadata
  return null
}
