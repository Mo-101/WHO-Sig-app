"use client"

import { useEffect, useState } from "react"
import { X, AlertTriangle, TrendingUp, MapPin, Activity } from "lucide-react"

type AlertLevel = "critical" | "high" | "medium" | "low"

interface AIAlert {
  id: string
  alertLevel: AlertLevel
  riskScore: number
  summary: string
  keyFindings: string[]
  recommendations: string[]
  affectedCountries: string[]
  trendAnalysis: string
  timestamp: Date
}

interface AIAlertPopupProps {
  alert: AIAlert
  onDismiss: () => void
}

export function AIAlertPopup({ alert, onDismiss }: AIAlertPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const alertColors = {
    critical: {
      bg: "bg-red-50",
      border: "border-red-500",
      text: "text-red-800",
      icon: "text-red-500",
      badge: "bg-red-500",
    },
    high: {
      bg: "bg-orange-50",
      border: "border-orange-500",
      text: "text-orange-800",
      icon: "text-orange-500",
      badge: "bg-orange-500",
    },
    medium: {
      bg: "bg-yellow-50",
      border: "border-yellow-500",
      text: "text-yellow-800",
      icon: "text-yellow-500",
      badge: "bg-yellow-500",
    },
    low: {
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-800",
      icon: "text-blue-500",
      badge: "bg-blue-500",
    },
  }

  const colors = alertColors[alert.alertLevel]

  return (
    <div
      className={`fixed top-20 right-6 z-50 w-96 rounded-lg border-l-4 ${colors.border} ${colors.bg} shadow-2xl transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-5 w-5 ${colors.icon}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${colors.text} uppercase text-sm`}>{alert.alertLevel} Alert</span>
                <span className={`${colors.badge} text-white text-xs px-2 py-0.5 rounded-full`}>
                  Risk: {alert.riskScore}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">AI Analysis - {alert.timestamp.toLocaleTimeString()}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onDismiss, 300)
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Summary */}
        <div className="mb-3">
          <p className={`text-sm ${colors.text} font-medium`}>{alert.summary}</p>
        </div>

        {/* Key Findings */}
        {alert.keyFindings.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <Activity className="h-3.5 w-3.5 text-gray-600" />
              <h4 className="text-xs font-semibold text-gray-700">Key Findings</h4>
            </div>
            <ul className="space-y-1">
              {alert.keyFindings.slice(0, 3).map((finding, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Affected Countries */}
        {alert.affectedCountries.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="h-3.5 w-3.5 text-gray-600" />
              <h4 className="text-xs font-semibold text-gray-700">Affected Regions</h4>
            </div>
            <p className="text-xs text-gray-600">
              {alert.affectedCountries.slice(0, 5).join(", ")}
              {alert.affectedCountries.length > 5 && ` +${alert.affectedCountries.length - 5} more`}
            </p>
          </div>
        )}

        {/* Trend Analysis */}
        <div className="mb-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-gray-600" />
            <h4 className="text-xs font-semibold text-gray-700">Trend Analysis</h4>
          </div>
          <p className="text-xs text-gray-600">{alert.trendAnalysis}</p>
        </div>

        {/* Recommendations */}
        {alert.recommendations.length > 0 && (
          <div className="bg-white bg-opacity-50 rounded p-2 mb-2">
            <h4 className="text-xs font-semibold text-gray-700 mb-1">Recommended Actions</h4>
            <ul className="space-y-1">
              {alert.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-gray-400 mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium py-1.5 px-3 rounded border border-gray-300 transition-colors">
            View Details
          </button>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onDismiss, 300)
            }}
            className="flex-1 bg-gray-700 hover:bg-gray-800 text-white text-xs font-medium py-1.5 px-3 rounded transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  )
}
