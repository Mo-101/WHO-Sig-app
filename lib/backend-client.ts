import { BackendSignal, SignalsResponse, LatestSignalsResponse, AssistantQueryRequest, AssistantQueryResponse } from "./backend-types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const BACKEND_TIMEOUT = 5000; // 5 second timeout

/**
 * Check if backend is available
 */
async function isBackendAvailable(): Promise<boolean> {
  if (!BACKEND_URL) return false;
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch signals from FastAPI backend
 * @param limit Maximum number of signals to return
 * @param offset Pagination offset
 * @param filters Optional filters (Country, Signal, Source, etc)
 */
export async function fetchBackendSignals(
  limit: number = 100,
  offset: number = 0,
  filters?: Record<string, string>
): Promise<SignalsResponse> {
  // Return empty response if backend URL not configured
  if (!BACKEND_URL) {
    console.warn("[v0] Backend URL not configured, skipping backend fetch");
    return { total: 0, limit, offset, items: [] };
  }

  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);

    const response = await fetch(`${BACKEND_URL}/signals?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("[v0] Backend unavailable, will use fallback data:", error instanceof Error ? error.message : String(error));
    return { total: 0, limit, offset, items: [] };
  }
}

/**
 * Fetch latest signals from backend
 */
export async function fetchLatestBackendSignals(limit: number = 10): Promise<BackendSignal[]> {
  if (!BACKEND_URL) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);

    const response = await fetch(`${BACKEND_URL}/signals/latest?limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data: LatestSignalsResponse = await response.json();
    return data.items;
  } catch (error) {
    console.warn("[v0] Backend latest signals unavailable:", error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Query signals using AI-powered assistant
 */
export async function queryBackendAssistant(
  request: AssistantQueryRequest
): Promise<AssistantQueryResponse> {
  if (!BACKEND_URL) {
    return {
      answer: "Backend not configured",
      plan: {},
      count: 0,
      preview: [],
      found: false,
      status: "error",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);

    const response = await fetch(`${BACKEND_URL}/assistant/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("[v0] Backend assistant unavailable:", error instanceof Error ? error.message : String(error));
    return {
      answer: "Assistant unavailable",
      plan: {},
      count: 0,
      preview: [],
      found: false,
      status: "error",
    };
  }
}

/**
 * Trigger Google Sheets ingestion on backend
 */
export async function triggerBackendIngestion(): Promise<{
  ok: boolean;
  inserted?: number;
  updated?: number;
  deleted?: number;
  error?: string;
}> {
  if (!BACKEND_URL) {
    return { ok: false, error: "Backend not configured" };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), BACKEND_TIMEOUT);

    const response = await fetch(`${BACKEND_URL}/ingest/google-sheet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("[v0] Backend ingestion failed:", error instanceof Error ? error.message : String(error));
    return { ok: false, error: String(error) };
  }
}
