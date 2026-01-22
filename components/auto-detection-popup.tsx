'use client'

import { X, AlertTriangle, Zap, TrendingUp } from 'lucide-react'
import { useState } from 'react'

interface AutoDetectionPopupProps {
  detection: {
    id: string
    type: 'anomaly' | 'surge' | 'trend'
    title: string
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    affected: string[]
    metric?: string
    change?: number
    source?: string
  }
  onDismiss: () => void
  onViewDetails: () => void
}

export function AutoDetectionPopup({ detection, onDismiss, onViewDetails }: AutoDetectionPopupProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const severityColors = {
    critical: 'bg-red-100 border-red-500 text-red-900',
    high: 'bg-orange-100 border-orange-500 text-orange-900',
    medium: 'bg-yellow-100 border-yellow-500 text-yellow-900',
    low: 'bg-blue-100 border-blue-500 text-blue-900',
  }

  const severityIcons = {
    critical: <AlertTriangle className="w-5 h-5 text-red-600" />,
    high: <Zap className="w-5 h-5 text-orange-600" />,
    medium: <TrendingUp className="w-5 h-5 text-yellow-600" />,
    low: <TrendingUp className="w-5 h-5 text-blue-600" />,
  }

  const typeIcons = {
    anomaly: '🔍',
    surge: '📈',
    trend: '📊',
  }

  return (
    <div className={`fixed bottom-6 right-2.5 max-w-sm ${severityColors[detection.severity]} border-2 rounded-lg p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-5`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl">{typeIcons[detection.type]}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm mb-1">{detection.title}</h3>
            <p className="text-xs opacity-90 mb-2">{detection.description}</p>

            {detection.metric && (
              <div className="text-xs font-semibold mb-2">
                {detection.metric}
                {detection.change && ` (${detection.change > 0 ? '+' : ''}${detection.change}%)`}
              </div>
            )}

            {detection.affected.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {detection.affected.slice(0, 3).map((item) => (
                  <span key={item} className="text-[10px] px-2 py-0.5 bg-black bg-opacity-20 rounded">
                    {item}
                  </span>
                ))}
                {detection.affected.length > 3 && (
                  <span className="text-[10px] px-2 py-0.5 bg-black bg-opacity-20 rounded">
                    +{detection.affected.length - 3} more
                  </span>
                )}
              </div>
            )}

            {detection.source && (
              <p className="text-[10px] opacity-75">Source: {detection.source}</p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setIsVisible(false)
            onDismiss()
          }}
          className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => {
            onViewDetails()
            setIsVisible(false)
          }}
          className="flex-1 text-xs font-semibold px-3 py-2 bg-black bg-opacity-20 hover:bg-opacity-30 rounded transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => {
            setIsVisible(false)
            onDismiss()
          }}
          className="text-xs font-semibold px-3 py-2 opacity-60 hover:opacity-100 transition-opacity"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
