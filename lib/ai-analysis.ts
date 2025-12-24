"use server"

import { generateObject, generateText } from "ai"
import { createAzure } from "@ai-sdk/azure"
import { z } from "zod"
import { WHO_DATA_SOURCES } from "./data-sources"
import { getEnhancedSystemPrompt, getDataSourcesContext } from "./ai-knowledge-base"
import { WHO_SYSTEM_PROMPT, WHO_TRAINING_EXAMPLES, WHO_ANALYSIS_FRAMEWORK } from "./ai-training-prompts"

const azure = createAzure({
  resourceName: "afro-ai-resource",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
  baseURL: "https://afro-ai-resource.openai.azure.com/openai/deployments/gpt-4o",
})

const gpt4o = azure("gpt-4o")

const gpt4oMini = azure("gpt-4o-mini")

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
    model: gpt4o,
    schema: outbreakAnalysisSchema,
    prompt: `${WHO_SYSTEM_PROMPT}

MONITORED DATA SOURCES:
${getDataSourcesContext()}

TRAINING CONTEXT:
${WHO_TRAINING_EXAMPLES.map((ex) => `${ex.role}: ${ex.content}`).join("\n\n")}

OUTBREAK DATA TO ANALYZE:
${JSON.stringify(events, null, 2)}

${WHO_ANALYSIS_FRAMEWORK}

Provide comprehensive risk assessment using WHO terminology and grading standards.
Consider regional patterns, disease-specific factors, and response capacity in African context.`,
    maxOutputTokens: 2000,
  })

  return object
}

export async function detectAnomalies(events: any[], historicalData?: any[]) {
  const { object } = await generateObject({
    model: gpt4oMini,
    schema: anomalyDetectionSchema,
    prompt: `${WHO_SYSTEM_PROMPT}

Analyze recent WHO disease events for anomalies using African outbreak patterns and epidemiological indicators.

RECENT EVENTS:
${JSON.stringify(events, null, 2)}

${historicalData ? `HISTORICAL CONTEXT:\n${JSON.stringify(historicalData, null, 2)}` : ""}

DETECTION CRITERIA:
- Unusual spikes: >50% increase in cases week-over-week
- Rapid geographic spread: Multi-district/country within 2 weeks
- CFR changes: Significant deviation from disease norm
- Grade escalations: Ungraded → Grade 2/3
- Seasonal anomalies: Off-season outbreaks
- Cross-border patterns: Simultaneous events in neighboring countries

Consider African context: rainy season impacts, population movements, healthcare access, and endemic disease baselines.`,
    maxOutputTokens: 1500,
  })

  return object
}

export async function generateOutbreakReport(events: any[], timeframe: string) {
  const { text } = await generateText({
    model: gpt4o,
    prompt: `${getEnhancedSystemPrompt()}

Generate a comprehensive WHO AFRO outbreak intelligence report for ${timeframe}.

DATA:
${JSON.stringify(events, null, 2)}

REPORT STRUCTURE:

1. EXECUTIVE SUMMARY
   - Overall situation snapshot
   - Key statistics (events, countries, cases, deaths)
   - Priority concerns requiring immediate attention

2. REGIONAL ANALYSIS
   - West Africa outbreak summary
   - East Africa outbreak summary
   - Central Africa outbreak summary
   - Southern Africa outbreak summary
   - Cross-regional patterns

3. DISEASE-SPECIFIC INTELLIGENCE
   - Priority disease updates with trends
   - CFR analysis and severity assessment
   - Transmission patterns and R0 estimates

4. GRADING ANALYSIS
   - Grade 3 events: Detailed situation and response needs
   - Grade 2 events: Monitoring and support requirements
   - Grade 1 events: Standard surveillance status
   - Ungraded events: Assessment pending

5. EPIDEMIOLOGICAL TRENDS
   - Increasing threats and emerging concerns
   - Stable situations requiring sustained monitoring  
   - Declining outbreaks and response success

6. RISK ASSESSMENT
   - Geographic spread risk (low/medium/high/critical)
   - Healthcare system impact
   - Vulnerable populations
   - Resource gaps

7. STRATEGIC RECOMMENDATIONS
   - Priority response actions
   - Resource allocation needs
   - Surveillance enhancement requirements
   - Inter-country coordination opportunities
   - Technical assistance priorities

Use WHO AFRO terminology, cite data sources, and maintain professional technical tone.`,
    maxOutputTokens: 3000,
  })

  return text
}

export async function queryOutbreakData(question: string, events: any[]) {
  const messages = [
    {
      role: "system" as const,
      content: WHO_SYSTEM_PROMPT,
    },
    ...WHO_TRAINING_EXAMPLES.map((ex) => ({
      role: ex.role as "user" | "assistant",
      content: ex.content,
    })),
    {
      role: "user" as const,
      content: `MONITORED DATA SOURCES:
${getDataSourcesContext()}

USER QUESTION: ${question}

AVAILABLE OUTBREAK DATA:
${JSON.stringify(events, null, 2)}

Provide a precise, context-aware answer using the patterns shown in training examples.`,
    },
  ]

  const { text } = await generateText({
    model: gpt4o,
    messages: messages,
    maxOutputTokens: 1000,
  })

  return text
}

export async function analyzeDataSourcesForAlerts(events: any[], dataSourceStatuses?: any[]) {
  const sourcesList = WHO_DATA_SOURCES.map((s) => `${s.name} (${s.url})`).join("\n")

  const { object } = await generateObject({
    model: gpt4o,
    schema: dataSourceMonitoringSchema,
    prompt: `You are monitoring WHO disease outbreak data sources for the African region.

Available Data Sources:
${sourcesList}

Current Outbreak Events:
${JSON.stringify(events.slice(0, 10), null, 2)}

${dataSourceStatuses ? `Data Source Status:\n${JSON.stringify(dataSourceStatuses, null, 2)}` : ""}

Analyze the current situation and determine if an alert should be generated based on:
1. Severity of active outbreaks (Grade 3 = critical, Grade 2 = high priority)
2. Number of simultaneous outbreaks across multiple countries
3. Rapid disease spread patterns
4. High case/death counts
5. Emergence of new diseases or unusual patterns
6. Data source availability issues

Generate an alert if there are concerning patterns that require WHO attention.
Provide actionable insights and recommendations.`,
    maxOutputTokens: 2000,
  })

  return object
}

export async function analyzeOutbreakDataWithSources(events: any[], dataSources: typeof WHO_DATA_SOURCES) {
  const { object } = await generateObject({
    model: gpt4o,
    schema: outbreakAnalysisSchema,
    prompt: `Analyze WHO disease outbreak data from multiple monitoring sources:

Data Sources Being Monitored:
${dataSources.map((s) => `- ${s.name}: ${s.description}`).join("\n")}

Current Outbreak Events:
${JSON.stringify(events, null, 2)}

Provide comprehensive risk assessment:
1. Overall alert level (critical/high/medium/low)
2. Risk score (0-100)
3. Executive summary
4. Key findings from the data
5. Recommended actions for WHO response
6. Affected countries
7. Trend analysis

Consider:
- Geographic spread patterns
- Disease severity and transmission
- Healthcare system capacity
- Population vulnerability
- Resource allocation needs`,
    maxOutputTokens: 2000,
  })

  return object
}
