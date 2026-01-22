'use client'

import React from "react"

import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, Database, MapPin, AlertTriangle, Stethoscope } from 'lucide-react'
import type { BackendSignal } from '@/lib/backend-types'

interface RecentSignalsProps {
  signals: BackendSignal[]
  isLoading: boolean
  onSignalClick: (signal: BackendSignal) => void
}

// Source icon and color mapping
const SOURCE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string; label: string }> = {
  'Backend Signal': {
    icon: <Database className="w-3 h-3" />,
    color: '#009edb',
    bgColor: 'bg-blue-50',
    label: 'Backend DB'
  },
  'Google Sheets': {
    icon: <MapPin className="w-3 h-3" />,
    color: '#34a853',
    bgColor: 'bg-green-50',
    label: 'Google Sheets'
  },
  'ProMED': {
    icon: <AlertTriangle className="w-3 h-3" />,
    color: '#ea4335',
    bgColor: 'bg-red-50',
    label: 'ProMED-mail'
  },
  'ECDC': {
    icon: <Stethoscope className="w-3 h-3" />,
    color: '#fbbc04',
    bgColor: 'bg-yellow-50',
    label: 'ECDC'
  }
}

function getSourceConfig(source?: string) {
  if (!source) return SOURCE_CONFIG['Backend Signal']
  
  const key = Object.keys(SOURCE_CONFIG).find(k => source.toLowerCase().includes(k.toLowerCase()))
  return key ? SOURCE_CONFIG[key] : SOURCE_CONFIG['Backend Signal']
}

export function RecentSignals({ signals, isLoading, onSignalClick }: RecentSignalsProps) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-bold text-[#1010ee] uppercase tracking-wide flex items-center gap-2">
        <span className="text-base">📡</span> Recent Signals
      </h3>

      {isLoading && (
        <div className="neu-card-sm p-4 text-center">
          <div className="inline-block animate-spin">
            <Clock className="w-4 h-4 text-[#009edb]" />
          </div>
          <p className="text-xs text-gray-600 mt-2">Loading signals...</p>
        </div>
      )}

      {!isLoading && signals.length === 0 && (
        <div className="neu-card-sm p-4 text-center">
          <AlertCircle className="w-4 h-4 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No recent signals</p>
        </div>
      )}

      {!isLoading && signals.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
          {signals.map((signal) => {
            const sourceConfig = getSourceConfig(signal.source)
            return (
              <button
                key={signal.id}
                onClick={() => onSignalClick(signal)}
                className="neu-card-sm p-3 text-left hover:neu-elevated transition-all w-full group"
              >
                <div className="flex items-start gap-2 mb-2">
                  <div style={{ color: sourceConfig.color }} className="mt-1 flex-shrink-0">
                    {sourceConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#009edb] transition-colors">
                      {signal.text}
                    </p>
                  </div>
                </div>
                
                {/* Source Badge and Metadata */}
                <div className="flex items-center justify-between gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className={`text-[8px] px-2 py-1 border-2 ${sourceConfig.bgColor}`}
                    style={{ color: sourceConfig.color, borderColor: sourceConfig.color }}
                  >
                    {sourceConfig.label}
                  </Badge>
                  <p className="text-[8px] text-gray-500 ml-auto">
                    {new Date(signal.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Additional metadata if available */}
                {signal.raw && (
                  <div className="text-[8px] text-gray-500 mt-2 space-y-0.5">
                    {signal.raw.country && (
                      <p className="truncate">📍 {signal.raw.country}</p>
                    )}
                    {signal.raw.disease && (
                      <p className="truncate">🦠 {signal.raw.disease}</p>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
