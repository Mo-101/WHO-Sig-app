import { neon } from "@neondatabase/serverless"

// This driver works over HTTP/WebSockets and is compatible with serverless environments
// It can connect to any PostgreSQL database, not just Neon
const sql = neon(process.env.DATABASE_URL!)

export async function initializeDatabase() {
  try {
    console.log("[v0] Initializing Azure PostgreSQL database...")

    await sql`
      CREATE TABLE IF NOT EXISTS who_events (
        id SERIAL PRIMARY KEY,
        event_id VARCHAR(255) UNIQUE NOT NULL,
        country VARCHAR(255) NOT NULL,
        disease VARCHAR(255) NOT NULL,
        grade VARCHAR(50) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        report_date DATE NOT NULL,
        year INTEGER NOT NULL,
        description TEXT,
        cases INTEGER,
        deaths INTEGER,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        protracted VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_country ON who_events(country)`
    await sql`CREATE INDEX IF NOT EXISTS idx_disease ON who_events(disease)`
    await sql`CREATE INDEX IF NOT EXISTS idx_grade ON who_events(grade)`
    await sql`CREATE INDEX IF NOT EXISTS idx_report_date ON who_events(report_date)`
    await sql`CREATE INDEX IF NOT EXISTS idx_year ON who_events(year)`

    await sql`
      CREATE TABLE IF NOT EXISTS data_sync_metadata (
        id SERIAL PRIMARY KEY,
        last_sync_time TIMESTAMP NOT NULL,
        records_synced INTEGER NOT NULL,
        source_url TEXT,
        sync_status VARCHAR(50) NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("[v0] Azure PostgreSQL database initialized successfully")
  } catch (error) {
    console.error("[v0] Database initialization error:", error)
    throw error
  }
}

export async function saveWHOEvents(events: any[]) {
  try {
    await sql`DELETE FROM who_events`

    for (const event of events) {
      await sql`
        INSERT INTO who_events (
          event_id, country, disease, grade, event_type, status,
          report_date, year, description, cases, deaths,
          latitude, longitude, protracted, updated_at
        ) VALUES (
          ${event.id},
          ${event.country},
          ${event.disease},
          ${event.grade},
          ${event.eventType},
          ${event.status},
          ${event.reportDate},
          ${event.year},
          ${event.description},
          ${event.cases || null},
          ${event.deaths || null},
          ${event.lat},
          ${event.lon},
          ${event.protracted || null},
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (event_id) 
        DO UPDATE SET
          country = EXCLUDED.country,
          disease = EXCLUDED.disease,
          grade = EXCLUDED.grade,
          event_type = EXCLUDED.event_type,
          status = EXCLUDED.status,
          report_date = EXCLUDED.report_date,
          year = EXCLUDED.year,
          description = EXCLUDED.description,
          cases = EXCLUDED.cases,
          deaths = EXCLUDED.deaths,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          protracted = EXCLUDED.protracted,
          updated_at = CURRENT_TIMESTAMP
      `
    }

    await sql`
      INSERT INTO data_sync_metadata (last_sync_time, records_synced, source_url, sync_status)
      VALUES (CURRENT_TIMESTAMP, ${events.length}, ${process.env.NEXT_PUBLIC_WHO_DATA_URL || ""}, 'success')
    `

    console.log(`[v0] Successfully saved ${events.length} events to Azure PostgreSQL`)
    return true
  } catch (error: any) {
    console.error("[v0] Error saving events to Azure PostgreSQL:", error)

    try {
      await sql`
        INSERT INTO data_sync_metadata (last_sync_time, records_synced, source_url, sync_status, error_message)
        VALUES (CURRENT_TIMESTAMP, 0, ${process.env.NEXT_PUBLIC_WHO_DATA_URL || ""}, 'failed', ${error.message})
      `
    } catch (metaError) {
      console.error("[v0] Failed to record sync error:", metaError)
    }

    throw error
  }
}

export async function getWHOEventsFromDB() {
  try {
    const result = await sql`
      SELECT 
        event_id as id,
        country,
        disease,
        grade,
        event_type as "eventType",
        status,
        report_date as "reportDate",
        year,
        description,
        cases,
        deaths,
        latitude as lat,
        longitude as lon,
        protracted
      FROM who_events
      ORDER BY report_date DESC
    `

    console.log(`[v0] Retrieved ${result.length} events from Azure PostgreSQL`)
    return result
  } catch (error) {
    console.error("[v0] Error fetching events from Azure PostgreSQL:", error)
    throw error
  }
}

export async function getLastSyncMetadata() {
  try {
    const result = await sql`
      SELECT * FROM data_sync_metadata
      ORDER BY created_at DESC
      LIMIT 1
    `

    return result[0] || null
  } catch (error) {
    console.error("[v0] Error fetching sync metadata from Azure PostgreSQL:", error)
    return null
  }
}
