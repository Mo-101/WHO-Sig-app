"use client"

import { useState } from "react"
import { X, MapPin, Calendar, Activity, AlertTriangle, Users, FileText } from "lucide-react"
import type { WHOEvent } from "@/lib/who-data"

interface EventDetailModalProps {
  event: WHOEvent
  relatedEvents: WHOEvent[]
  onClose: () => void
  onJumpToLocation: (event: WHOEvent) => void
}

export function EventDetailModal({ event, relatedEvents, onClose, onJumpToLocation }: EventDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "timeline" | "related" | "response">("details")

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "Grade 3":
        return "text-[#ff3355] bg-[#ff3355]/10"
      case "Grade 2":
        return "text-[#ff9933] bg-[#ff9933]/10"
      case "Grade 1":
        return "text-[#ffcc00] bg-[#ffcc00]/10"
      default:
        return "text-[#6a7a94] bg-[#6a7a94]/10"
    }
  }

  const casesFatalityRate = event.deaths && event.cases ? ((event.deaths / event.cases) * 100).toFixed(1) : "N/A"

  const mockTimeline = [
    {
      date: event.reportDate,
      title: "Event Reported",
      description: `Initial report of ${event.disease} outbreak in ${event.country}`,
      type: "report",
    },
    {
      date: new Date(new Date(event.reportDate).getTime() - 86400000).toISOString().split("T")[0],
      title: "Alert Issued",
      description: `WHO AFRO issued ${event.grade} alert for ${event.country}`,
      type: "alert",
    },
    {
      date: new Date(new Date(event.reportDate).getTime() - 172800000).toISOString().split("T")[0],
      title: "First Cases Detected",
      description: `Initial cases detected in ${event.country}`,
      type: "detection",
    },
  ]

  const mockResponseActions = [
    {
      action: "Field Epidemiologists Deployed",
      status: "Completed",
      date: event.reportDate,
    },
    {
      action: "Laboratory Testing Enhanced",
      status: "In Progress",
      date: event.reportDate,
    },
    {
      action: "Community Surveillance Activated",
      status: "Completed",
      date: new Date(new Date(event.reportDate).getTime() - 86400000).toISOString().split("T")[0],
    },
    {
      action: "Risk Communication Campaign",
      status: "Planned",
      date: new Date(new Date(event.reportDate).getTime() + 86400000).toISOString().split("T")[0],
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#e8eef5] rounded-2xl neu-shadow overflow-hidden flex flex-col m-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0056b3] to-[#009edb] p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getGradeColor(event.grade)}`}>
                  {event.grade}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-xs font-semibold">{event.status}</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{event.disease}</h2>
              <p className="text-white/90 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.country}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#d1d9e6] bg-[#e8eef5] px-6">
          <div className="flex gap-6">
            {["details", "timeline", "related", "response"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 text-sm font-semibold capitalize transition-colors relative ${
                  activeTab === tab ? "text-[#009edb]" : "text-[#6a7a94] hover:text-[#2c3e50]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#009edb] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === "details" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/40 rounded-xl p-4 text-center neu-shadow-sm">
                  <div className="text-2xl font-bold text-[#009edb]">{event.cases?.toLocaleString() || "N/A"}</div>
                  <div className="text-xs text-[#6a7a94] uppercase tracking-wide mt-1">Total Cases</div>
                </div>
                <div className="bg-white/40 rounded-xl p-4 text-center neu-shadow-sm">
                  <div className="text-2xl font-bold text-[#ff3355]">{event.deaths?.toLocaleString() || "N/A"}</div>
                  <div className="text-xs text-[#6a7a94] uppercase tracking-wide mt-1">Deaths</div>
                </div>
                <div className="bg-white/40 rounded-xl p-4 text-center neu-shadow-sm">
                  <div className="text-2xl font-bold text-[#ff9933]">{casesFatalityRate}%</div>
                  <div className="text-xs text-[#6a7a94] uppercase tracking-wide mt-1">CFR</div>
                </div>
                <div className="bg-white/40 rounded-xl p-4 text-center neu-shadow-sm">
                  <div className="text-2xl font-bold text-[#009edb]">{event.year}</div>
                  <div className="text-xs text-[#6a7a94] uppercase tracking-wide mt-1">Year</div>
                </div>
              </div>

              {/* Event Information */}
              <div className="bg-white/40 rounded-xl p-5 neu-shadow-sm">
                <h3 className="text-sm font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Event Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[#d1d9e6]">
                    <span className="text-xs text-[#6a7a94] uppercase">Event Type</span>
                    <span className="text-sm font-semibold text-[#2c3e50]">{event.eventType}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#d1d9e6]">
                    <span className="text-xs text-[#6a7a94] uppercase">Report Date</span>
                    <span className="text-sm font-semibold text-[#2c3e50]">
                      {new Date(event.reportDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#d1d9e6]">
                    <span className="text-xs text-[#6a7a94] uppercase">Location</span>
                    <span className="text-sm font-semibold text-[#2c3e50]">
                      {event.lat.toFixed(4)}, {event.lon.toFixed(4)}
                    </span>
                  </div>
                  <div className="py-2">
                    <span className="text-xs text-[#6a7a94] uppercase block mb-2">Description</span>
                    <p className="text-sm text-[#2c3e50] leading-relaxed">{event.description}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => onJumpToLocation(event)}
                  className="flex-1 px-4 py-3 bg-[#009edb] text-white text-sm font-semibold rounded-xl hover:bg-[#0056b3] transition-colors neu-shadow"
                >
                  View on Map
                </button>
                <button className="flex-1 px-4 py-3 bg-[#e8eef5] text-[#2c3e50] text-sm font-semibold rounded-xl hover:bg-[#d1d9e6] transition-colors neu-shadow">
                  Export Details
                </button>
              </div>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0056b3] uppercase tracking-wide mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Event Timeline
              </h3>
              <div className="relative pl-6">
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-[#d1d9e6]" />
                {mockTimeline.map((item, idx) => (
                  <div key={idx} className="relative mb-6 last:mb-0">
                    <div className="absolute -left-[25px] w-3 h-3 rounded-full bg-[#009edb] border-2 border-[#e8eef5]" />
                    <div className="bg-white/40 rounded-xl p-4 neu-shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-bold text-[#2c3e50]">{item.title}</h4>
                        <span className="text-xs text-[#6a7a94]">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-[#5a6a7a] leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "related" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0056b3] uppercase tracking-wide mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Related Events ({relatedEvents.length})
              </h3>
              {relatedEvents.length === 0 ? (
                <div className="text-center py-8 text-[#6a7a94] text-sm">No related events found</div>
              ) : (
                <div className="space-y-3">
                  {relatedEvents.map((relEvent) => (
                    <div
                      key={relEvent.id}
                      onClick={() => onJumpToLocation(relEvent)}
                      className="bg-white/40 rounded-xl p-4 neu-shadow-sm cursor-pointer hover:bg-white/60 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#2c3e50] mb-1">{relEvent.disease}</h4>
                          <p className="text-xs text-[#6a7a94]">{relEvent.country}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${getGradeColor(relEvent.grade)}`}>
                          {relEvent.grade}
                        </span>
                      </div>
                      <p className="text-xs text-[#5a6a7a] leading-relaxed">{relEvent.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "response" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0056b3] uppercase tracking-wide mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Response Actions
              </h3>
              <div className="space-y-3">
                {mockResponseActions.map((action, idx) => (
                  <div key={idx} className="bg-white/40 rounded-xl p-4 neu-shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold text-[#2c3e50]">{action.action}</h4>
                      <span
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          action.status === "Completed"
                            ? "bg-[#00c853]/15 text-[#00c853]"
                            : action.status === "In Progress"
                              ? "bg-[#ff9933]/15 text-[#ff9933]"
                              : "bg-[#6a7a94]/15 text-[#6a7a94]"
                        }`}
                      >
                        {action.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#6a7a94]">Target Date: {new Date(action.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white/40 rounded-xl p-4 neu-shadow-sm">
                <h4 className="text-sm font-bold text-[#0056b3] mb-3">Resource Requirements</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6a7a94]">Field Epidemiologists</span>
                    <span className="text-[#2c3e50] font-semibold">5 deployed / 2 needed</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6a7a94]">Laboratory Capacity</span>
                    <span className="text-[#2c3e50] font-semibold">80% utilized</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6a7a94]">Medical Supplies</span>
                    <span className="text-[#2c3e50] font-semibold">Adequate</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
