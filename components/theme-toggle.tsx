"use client"

import { useRouter } from "next/navigation"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  isDark?: boolean
}

export function ThemeToggle({ isDark = false }: ThemeToggleProps) {
  const router = useRouter()

  const handleToggle = () => {
    router.push(isDark ? "/" : "/dark")
  }

  if (isDark) {
    return (
      <button
        onClick={handleToggle}
        className="group relative w-16 h-8 bg-[#0f1419] rounded-full shadow-lg border border-[#334155] transition-all duration-300 hover:border-[#3b82f6]"
        aria-label="Switch to light theme"
      >
        <div className="absolute left-1 top-1 w-6 h-6 bg-gradient-to-br from-[#3b82f6] to-[#1e40af] rounded-full shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <Moon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40">
          <Sun className="w-3.5 h-3.5 text-[#94a3b8]" />
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className="group relative w-16 h-8 bg-[#e8eef5] rounded-full neu-shadow transition-all duration-300 hover:shadow-lg"
      aria-label="Switch to dark theme"
    >
      <div className="absolute right-1 top-1 w-6 h-6 bg-gradient-to-br from-[#009edb] to-[#0056b3] rounded-full neu-shadow flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
        <Sun className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-40">
        <Moon className="w-3.5 h-3.5 text-[#6a7a94]" />
      </div>
    </button>
  )
}
