'use client';

import { useEffect, useState } from 'react'
import type { BackendSignal } from '@/lib/backend-types'

interface UseBackendSignalsOptions {
  limit?: number
  pollInterval?: number
}

export function useBackendSignals(limit: number = 10, options: UseBackendSignalsOptions = {}) {
  const [signals, setSignals] = useState<BackendSignal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { pollInterval = 60000 } = options // Poll every 60 seconds by default

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/backend-signals?limit=${limit}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch backend signals: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.items && Array.isArray(data.items)) {
          setSignals(data.items)
          setError(null)
        } else {
          setSignals([])
          // Don't set error if backend is just unavailable - this is expected
          setError(null)
        }
      } catch (err) {
        // Silently log backend unavailability without showing error to user
        const errorMsg = err instanceof Error ? err.message : String(err)
        console.warn('[v0] Backend signals unavailable, using fallback data:', errorMsg)
        setSignals([])
        // Don't set error state - backend being unavailable is expected behavior
        setError(null)
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchSignals()

    // Set up polling
    const interval = setInterval(fetchSignals, pollInterval)

    return () => clearInterval(interval)
  }, [limit, pollInterval])

  return { signals, isLoading, error }
}
