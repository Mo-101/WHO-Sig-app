// Data source configuration and priorities
export interface DataSource {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  type: "api" | "sheet" | "backend";
  url?: string;
}

export const DATA_SOURCES: Record<string, DataSource> = {
  backend_signals: {
    id: "backend_signals",
    name: "Backend Signals Database",
    description: "FastAPI backend PostgreSQL signal database with AI-powered queries",
    enabled: true,
    priority: 1,
    type: "backend",
    url: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  },
  google_sheets: {
    id: "google_sheets",
    name: "Google Sheets",
    description: "WHO AFRO signal data from Google Sheets",
    enabled: true,
    priority: 2,
    type: "sheet",
    url: process.env.NEXT_PUBLIC_WHO_DATA_URL,
  },
  promed_mail: {
    id: "promed_mail",
    name: "ProMED-mail",
    description: "Open source disease outbreak alerts",
    enabled: false,
    priority: 3,
    type: "api",
    url: "https://www.promedmail.org/",
  },
  epidemic_intelligence: {
    id: "epidemic_intelligence",
    name: "Epidemic Intelligence",
    description: "ECDC epidemic intelligence data",
    enabled: false,
    priority: 4,
    type: "api",
    url: "https://www.ecdc.europa.eu/",
  },
};

/**
 * Get enabled data sources sorted by priority
 */
export function getEnabledDataSources(): DataSource[] {
  return Object.values(DATA_SOURCES)
    .filter((source) => source.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const response = await fetch(`${backendUrl}/health`, { 
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
