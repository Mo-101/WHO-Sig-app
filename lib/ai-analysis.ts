"use server"

import { generateObject, generateText } from "ai"
import { createAzure } from "@ai-sdk/azure"
import { z } from "zod"
import type { WHO_DATA_SOURCES } from "./data-sources"
import { WHO_SYSTEM_PROMPT, WHO_ANALYSIS_FRAMEWORK } from "./ai-training-prompts"

const azure = createAzure({
  resourceName: "afro-ai-resource",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
  apiVersion: "2023-05-15", // Oldest stable GA version compatible with AI SDK 5 spec v2
})

const afroAI = azure("AFRO-AI")

const gpt4o = afroAI

// Keep backward compatibility with gpt-4o-mini for specific use cases
const gpt4oMini = afroAI

const outbreakAnalysisSchema = z.object({
  alertLevel: z.enum(["critical", "high", "medium", "low"]),
  riskScore: z.number().min(0).max(100),
  summary: z.string(),
  keyFindings: z.array(z.string()),
  recommendations: z.array(z.string()),
  affectedCountries: z.array(z.string()),
  trendAnalysis: z.string(),
})

const anomalyDetectionSchema = z.object({
  anomalyDetected: z.boolean(),
  anomalyType: z.enum(["spike", "spread", "unusual_pattern", "none"]),
  severity: z.enum(["critical", "high", "medium", "low"]),
  description: z.string(),
  affectedRegions: z.array(z.string()),
  suggestedAction: z.string(),
})

const dataSourceMonitoringSchema = z.object({
  alertGenerated: z.boolean(),
  alertLevel: z.enum(["critical", "high", "medium", "low", "info"]),
  summary: z.string(),
  findings: z.array(z.string()),
  affectedSources: z.array(z.string()),
  recommendations: z.array(z.string()),
  estimatedImpact: z.string(),
})

export async function analyzeOutbreakData(events: any[]) {
  const { object } = await generateObject({
    model: afroAI,
    schema: outbreakAnalysisSchema,
    prompt: `${WHO_SYSTEM_PROMPT}

Analyze this outbreak data for WHO African region:

${JSON.stringify(events.slice(0, 5), null, 2)}

${WHO_ANALYSIS_FRAMEWORK}

Provide risk assessment using WHO grading: Grade 3 (critical), Grade 2 (high), Grade 1 (medium), Grade 0 (low).`,
  })

  return object
}

export async function detectAnomalies(events: any[], historicalData?: any[]) {
  const { object } = await generateObject({
    model: afroAI,
    schema: anomalyDetectionSchema,
    prompt: `${WHO_SYSTEM_PROMPT}

Analyze recent WHO disease events for anomalies:

RECENT EVENTS:
${JSON.stringify(events.slice(0, 3), null, 2)}

${historicalData ? `HISTORICAL:\n${JSON.stringify(historicalData.slice(0, 2), null, 2)}` : ""}

Look for: spikes >50%, rapid spread, unusual patterns, seasonal anomalies.`,
  })

  return object
}

export async function generateOutbreakReport(events: any[], timeframe: string) {
  const { text } = await generateText({
    model: afroAI,
    prompt: `${WHO_SYSTEM_PROMPT}

Generate WHO AFRO outbreak intelligence report for ${timeframe}.

DATA:
${JSON.stringify(events.slice(0, 10), null, 2)}

Include: executive summary, regional analysis, disease-specific updates, grading analysis, trends, risk assessment, recommendations.`,
  })

  return text
}

export async function queryOutbreakData(question: string, events: any[]) {
  const { text } = await generateText({
    model: afroAI,
    prompt: `${WHO_SYSTEM_PROMPT}

Question: ${question}

Available outbreak data:
${JSON.stringify(events.slice(0, 5), null, 2)}

Provide precise answer using WHO terminology and African regional context.`,
  })

  return text
}

export async function analyzeDataSourcesForAlerts(events: any[], dataSourceStatuses?: any[]) {
  const { object } = await generateObject({
    model: afroAI,
    schema: dataSourceMonitoringSchema,
    prompt: `Monitor WHO disease outbreak data sources for African region.

Current events:
${JSON.stringify(events.slice(0, 5), null, 2)}

${dataSourceStatuses ? `Source status:\n${JSON.stringify(dataSourceStatuses.slice(0, 3), null, 2)}` : ""}

Check for: Grade 3 events, multiple simultaneous outbreaks, rapid spread, high case counts, new diseases.`,
  })

  return object
}

export async function analyzeOutbreakDataWithSources(events: any[], dataSources: typeof WHO_DATA_SOURCES) {
  const { object } = await generateObject({
    model: afroAI,
    schema: outbreakAnalysisSchema,
    prompt: `Analyze WHO disease outbreak data:

Data sources: ${dataSources.length} monitoring sources

Current events:
${JSON.stringify(events.slice(0, 5), null, 2)}

Provide: alert level, risk score (0-100), summary, findings, recommendations, affected countries, trend analysis.`,
  })

  return object
}
