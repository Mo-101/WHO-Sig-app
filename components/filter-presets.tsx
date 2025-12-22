"use client"

import { useState } from "react"
import { Save, Trash2, Filter } from "lucide-react"

interface FilterPreset {
  id: string
  name: string
  filters: {
    grades: string[]
    countries: string[]
    diseases: string[]
    eventTypes: string[]
    year: number
  }
}

interface FilterPresetsProps {
  currentFilters: {
    selectedGrades: string[]
    selectedCountries: string[]
    selectedDiseases: string[]
    selectedEventTypes: string[]
    selectedYear: number
  }
  onApplyPreset: (preset: FilterPreset) => void
}

export function FilterPresets({ currentFilters, onApplyPreset }: FilterPresetsProps) {
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("who-filter-presets")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState("")

  const savePreset = () => {
    if (!presetName.trim()) return

    const newPreset: FilterPreset = {
      id: crypto.randomUUID(),
      name: presetName,
      filters: {
        grades: currentFilters.selectedGrades,
        countries: currentFilters.selectedCountries,
        diseases: currentFilters.selectedDiseases,
        eventTypes: currentFilters.selectedEventTypes,
        year: currentFilters.selectedYear,
      },
    }

    const updated = [...presets, newPreset]
    setPresets(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("who-filter-presets", JSON.stringify(updated))
    }
    setPresetName("")
    setShowSaveDialog(false)
  }

  const deletePreset = (id: string) => {
    const updated = presets.filter((p) => p.id !== id)
    setPresets(updated)
    if (typeof window !== "undefined") {
      localStorage.setItem("who-filter-presets", JSON.stringify(updated))
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide">
          <Filter className="inline w-3 h-3 mr-1" />
          Filter Presets
        </h3>
        <button
          onClick={() => setShowSaveDialog(!showSaveDialog)}
          className="text-[#009edb] hover:text-[#0056b3] transition-colors"
          title="Save current filters"
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      </div>

      {showSaveDialog && (
        <div className="mb-2 p-2 bg-white/40 rounded-lg">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="w-full px-2 py-1 rounded text-xs bg-[#e8eef5] neu-shadow-inset-sm border-none focus:outline-none focus:ring-1 focus:ring-[#009edb] mb-2"
          />
          <div className="flex gap-2">
            <button
              onClick={savePreset}
              className="flex-1 px-2 py-1 text-[10px] bg-[#009edb] text-white rounded hover:bg-[#0056b3] transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSaveDialog(false)
                setPresetName("")
              }}
              className="flex-1 px-2 py-1 text-[10px] bg-[#e8eef5] text-[#6a7a94] rounded hover:bg-[#d1d9e6] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {presets.length === 0 ? (
          <p className="text-[10px] text-[#6a7a94] italic">No saved presets</p>
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className="flex items-center justify-between p-2 bg-white/40 rounded-lg hover:bg-white/60 transition-colors"
            >
              <button
                onClick={() => onApplyPreset(preset)}
                className="flex-1 text-left text-xs text-[#2c3e50] font-medium hover:text-[#009edb] transition-colors"
              >
                {preset.name}
              </button>
              <button
                onClick={() => deletePreset(preset.id)}
                className="text-[#ff3355] hover:text-[#ff0033] transition-colors"
                title="Delete preset"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
