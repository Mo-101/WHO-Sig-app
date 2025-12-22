"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"

interface AdvancedSearchProps {
  events: any[]
  onSearchResults: (results: any[]) => void
}

export function AdvancedSearch({ events, onSearchResults }: AdvancedSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)

  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []

    const query = searchQuery.toLowerCase()
    const matches = new Set<string>()

    events.forEach((event) => {
      if (event.country.toLowerCase().includes(query)) matches.add(event.country)
      if (event.disease.toLowerCase().includes(query)) matches.add(event.disease)
      if (event.description.toLowerCase().includes(query)) matches.add(event.description.substring(0, 50) + "...")
    })

    return Array.from(matches).slice(0, 8)
  }, [searchQuery, events])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      onSearchResults(events)
      return
    }

    const filtered = events.filter((event) => {
      const q = query.toLowerCase()
      return (
        event.country.toLowerCase().includes(q) ||
        event.disease.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.eventType.toLowerCase().includes(q) ||
        event.grade.toLowerCase().includes(q)
      )
    })

    onSearchResults(filtered)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    handleSearch(suggestion)
    setShowSuggestions(false)
  }

  const handleClear = () => {
    setSearchQuery("")
    onSearchResults(events)
    setShowSuggestions(false)
  }

  return (
    <div className="relative mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6a7a94]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Search events, countries, diseases..."
          className="w-full pl-10 pr-10 py-2 rounded-lg bg-[#e8eef5] neu-shadow-inset-sm text-xs text-[#2c3e50] placeholder:text-[#6a7a94] border-none focus:outline-none focus:ring-1 focus:ring-[#009edb]"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6a7a94] hover:text-[#2c3e50]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#e8eef5] rounded-lg neu-shadow max-h-48 overflow-y-auto z-50">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-3 py-2 text-xs text-[#2c3e50] hover:bg-white/50 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
