"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check initial theme from localStorage or system preference
    const stored = localStorage.getItem("theme")
    const systemPrefers = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = stored === "dark" || (!stored && systemPrefers)
    
    setIsDark(shouldBeDark)
    document.documentElement.classList.toggle("dark", shouldBeDark)
  }, [])

  const handleToggle = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")
    document.documentElement.classList.toggle("dark", newTheme)
  }

  if (isDark) {
    return (
      <button
        onClick={handleToggle}
        className="neu-button p-2.5 rounded-lg flex items-center justify-center group"
        aria-label="Switch to light theme"
      >
        <Moon className="w-5 h-5 text-gradient-cyan icon-3d icon-3d-pulse" />
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      className="neu-button p-2.5 rounded-lg flex items-center justify-center group"
      aria-label="Switch to dark theme"
    >
      <Sun className="w-5 h-5 text-gradient-flame icon-3d icon-3d-bounce" />
    </button>
  )
}
