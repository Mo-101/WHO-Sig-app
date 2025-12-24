import type React from "react"

type GradeSummary = {
  g3: number
  g2: number
  g1: number
  gu: number
}

const GRADE_STYLES = {
  "Grade 3": "border-l-4 border-[#ff3355]",
  "Grade 2": "border-l-4 border-[#ff9933]",
  "Grade 1": "border-l-4 border-[#ffcc00]",
  Ungraded: "border-l-4 border-[#a0a0b0]",
}

export const GradeSummaryCard: React.FC<{ summary: GradeSummary }> = ({ summary }) => {
  const entries = [
    { grade: "Grade 3" as keyof typeof GRADE_STYLES, count: summary.g3 },
    { grade: "Grade 2" as keyof typeof GRADE_STYLES, count: summary.g2 },
    { grade: "Grade 1" as keyof typeof GRADE_STYLES, count: summary.g1 },
    { grade: "Ungraded" as keyof typeof GRADE_STYLES, count: summary.gu },
  ]

  return (
    <div className="space-y-2.5">
      {entries.map(({ grade, count }) => (
        <div
          key={grade}
          className={`flex justify-between items-center px-4 py-3 bg-surface rounded-neu shadow-neu ${GRADE_STYLES[grade]}`}
        >
          <span className="text-xs font-medium text-[#6a7a94]">{grade}</span>
          <span className="text-lg font-bold text-[#2c3e50]">{count}</span>
        </div>
      ))}
    </div>
  )
}

export default GradeSummaryCard
