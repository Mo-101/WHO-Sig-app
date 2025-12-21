"use client"

import { useState } from "react"
import { Brain, Sparkles, TrendingUp, AlertCircle } from "lucide-react"
import { analyzeOutbreakData, detectAnomalies, queryOutbreakData } from "@/lib/ai-analysis"

interface AIMonitoringPanelProps {
  events: any[]
  onAlertGenerated?: (alert: any) => void
}

export function AIMonitoringPanel({ events, onAlertGenerated }: AIMonitoringPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [query, setQuery] = useState("")
  const [queryResult, setQueryResult] = useState("")

  const handleAnalyzeData = async () => {
    setIsAnalyzing(true)
    try {
      const analysis = await analyzeOutbreakData(events)
      const anomalies = await detectAnomalies(events)

      if (anomalies.anomalyDetected && anomalies.severity !== "low") {
        onAlertGenerated?.({
          id: crypto.randomUUID(),
          alertLevel: anomalies.severity,
          riskScore: analysis.riskScore,
          summary: anomalies.description,
          keyFindings: analysis.keyFindings,
          recommendations: analysis.recommendations,
          affectedCountries: analysis.affectedCountries,
          trendAnalysis: analysis.trendAnalysis,
          timestamp: new Date(),
        })
      }
    } catch (error) {
      console.error("AI Analysis Error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleQuery = async () => {
    if (!query.trim()) return
    setIsAnalyzing(true)
    try {
      const result = await queryOutbreakData(query, events)
      setQueryResult(result)
    } catch (error) {
      console.error("Query Error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-800">AI Monitoring</h3>
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </div>

      {/* Auto Analysis */}
      <div className="mb-4">
        <button
          onClick={handleAnalyzeData}
          disabled={isAnalyzing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Run AI Analysis
            </>
          )}
        </button>
        <p className="text-xs text-gray-500 mt-1">Detect anomalies and generate risk alerts</p>
      </div>

      {/* Natural Language Query */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ask AI about outbreaks</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuery()}
            placeholder="e.g., What are the trends for respiratory diseases?"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleQuery}
            disabled={isAnalyzing || !query.trim()}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Ask
          </button>
        </div>

        {queryResult && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{queryResult}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
