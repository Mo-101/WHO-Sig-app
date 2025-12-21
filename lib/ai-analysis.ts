"use server"

import { generateObject, generateText } from "ai"
import { createAzure } from "@ai-sdk/azure"
import { z } from "zod"

const azure = createAzure({
  resourceName: "afro-osl-resource",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
})

const gpt4o = azure("gpt-4o", {
  apiVersion: "2025-01-01-preview",
})

const gpt4oMini = azure("gpt-4o-mini", {
  apiVersion: "2025-01-01-preview",
})

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

export async function analyzeOutbreakData(events: any[]) {
  const { object } = await generateObject({
    model: gpt4o, // Use Azure model
    schema: outbreakAnalysisSchema,
    prompt: `Analyze this WHO disease outbreak data and provide risk assessment:
    
${JSON.stringify(events, null, 2)}

Provide:
1. Overall alert level based on severity and spread
2. Risk score (0-100)
3. Summary of current situation
4. Key findings
5. Recommendations for WHO action
6. Affected countries list
7. Trend analysis`,
    maxOutputTokens: 2000,
  })

  return object
}

export async function detectAnomalies(events: any[], historicalData?: any[]) {
  const { object } = await generateObject({
    model: gpt4oMini, // Use Azure model
    schema: anomalyDetectionSchema,
    prompt: `Analyze recent WHO disease events for anomalies:

Recent Events:
${JSON.stringify(events, null, 2)}

${historicalData ? `Historical Context:\n${JSON.stringify(historicalData, null, 2)}` : ""}

Detect:
1. Unusual spikes in cases or deaths
2. Rapid geographic spread
3. Unexpected disease patterns
4. Grade escalations

Provide anomaly details and suggested actions.`,
    maxOutputTokens: 1500,
  })

  return object
}

export async function generateOutbreakReport(events: any[], timeframe: string) {
  const { text } = await generateText({
    model: gpt4o, // Use Azure model
    prompt: `Generate a comprehensive WHO outbreak report for ${timeframe}:

Data:
${JSON.stringify(events, null, 2)}

Include:
1. Executive Summary
2. Geographic Distribution Analysis
3. Disease-specific Insights
4. Trends and Patterns
5. Risk Assessment
6. Recommendations

Format as a professional WHO-style report.`,
    maxOutputTokens: 3000,
  })

  return text
}

export async function queryOutbreakData(question: string, events: any[]) {
  const { text } = await generateText({
    model: gpt4o, // Use Azure model
    prompt: `Answer this question about WHO disease outbreaks:

Question: ${question}

Available Data:
${JSON.stringify(events, null, 2)}

Provide a clear, accurate answer based on the data.`,
    maxOutputTokens: 1000,
  })

  return text
}
