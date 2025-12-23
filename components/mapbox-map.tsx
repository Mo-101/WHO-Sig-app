"use client"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"
import { Card } from "@/components/ui/card"
import { getMapboxToken } from "@/lib/mapbox-config"
import type { WHOEvent } from "@/lib/who-data"

interface MapboxMapProps {
  events: WHOEvent[]
  selectedEvent: WHOEvent | null
  onEventClick: (event: WHOEvent) => void
}

export interface MapboxMapRef {
  flyToLocation: (lat: number, lon: number, zoom?: number, pitch?: number) => void
}

const MapboxMap = forwardRef<MapboxMapRef, MapboxMapProps>(({ events, selectedEvent, onEventClick }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markers = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [tokenValidated, setTokenValidated] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = await getMapboxToken()

        if (!token) {
          setError("MAPBOX_ACCESS_TOKEN is not configured. Please add it to your environment variables.")
          setTokenValidated(false)
          setIsCheckingToken(false)
          return
        }

        // Basic token validation
        if (!token.startsWith("pk.") || token.length < 20) {
          setError('Invalid MAPBOX_ACCESS_TOKEN format. Token should start with "pk." and be at least 20 characters.')
          setTokenValidated(false)
          setIsCheckingToken(false)
          return
        }

        console.log("[v0] Mapbox token validated successfully")
        setTokenValidated(true)
        setError(null)
      } catch (err) {
        console.error("[v0] Token validation error:", err)
        setError("Failed to validate Mapbox token")
        setTokenValidated(false)
      } finally {
        setIsCheckingToken(false)
      }
    }

    validateToken()
  }, [])

  useEffect(() => {
    if (!tokenValidated || !mapContainer.current || map.current) return

    const initMap = async () => {
      try {
        // Dynamic import of mapbox-gl only after token validation
        const mapboxgl = (await import("mapbox-gl")).default

        // Set the access token
        mapboxgl.accessToken = await getMapboxToken()

        console.log("[v0] Initializing Mapbox map...")

        // Create map instance with new keyword
        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: [20, 0],
          zoom: 2,
          projection: "mercator",
        })

        map.current.on("load", () => {
          console.log("[v0] Map loaded successfully")
          setMapLoaded(true)
        })

        map.current.on("error", (e: any) => {
          console.error("[v0] Map error:", e)
          setError("Map failed to load. Please check your connection and API token.")
        })
      } catch (err) {
        console.error("[v0] Map initialization error:", err)
        setError("Failed to initialize map. Please ensure MAPBOX_ACCESS_TOKEN is properly configured.")
        setTokenValidated(false)
      }
    }

    initMap()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [tokenValidated])

  useEffect(() => {
    if (!map.current || !mapLoaded || !tokenValidated) return

    const updateMarkers = async () => {
      try {
        const mapboxgl = (await import("mapbox-gl")).default

        // Clear existing markers
        markers.current.forEach((marker) => marker.remove())
        markers.current = []

        const gradeColors: Record<string, string> = {
          "Grade 3": "#ff3355",
          "Grade 2": "#ff9933",
          "Grade 1": "#ffcc00",
          Ungraded: "#a0a0b0",
        }

        events.forEach((event) => {
          if (event.latitude && event.longitude) {
            const el = document.createElement("div")
            el.className = "marker"
            el.style.backgroundColor = gradeColors[event.grade] || "#a0a0b0"
            el.style.width = selectedEvent?.id === event.id ? "18px" : "14px"
            el.style.height = selectedEvent?.id === event.id ? "18px" : "14px"
            el.style.borderRadius = "50%"
            el.style.cursor = "pointer"
            el.style.border = "2px solid white"
            el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"
            el.style.transition = "all 0.2s"

            el.addEventListener("mouseenter", () => {
              el.style.transform = "scale(1.3)"
            })

            el.addEventListener("mouseleave", () => {
              el.style.transform = "scale(1)"
            })

            el.addEventListener("click", () => {
              onEventClick(event)
            })

            const marker = new mapboxgl.Marker(el)
              .setLngLat([event.longitude, event.latitude])
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(`
                    <div style="padding: 8px;">
                      <strong>${event.disease}</strong><br/>
                      ${event.country}<br/>
                      <span style="color: ${gradeColors[event.grade]}">${event.grade}</span>
                    </div>
                  `),
              )
              .addTo(map.current)

            markers.current.push(marker)
          }
        })
      } catch (err) {
        console.error("[v0] Error updating markers:", err)
      }
    }

    updateMarkers()
  }, [events, mapLoaded, selectedEvent, onEventClick, tokenValidated])

  useEffect(() => {
    if (selectedEvent && map.current && mapLoaded && selectedEvent.latitude && selectedEvent.longitude) {
      map.current.flyTo({
        center: [selectedEvent.longitude, selectedEvent.latitude],
        zoom: 6,
        duration: 1500,
      })
    }
  }, [selectedEvent, mapLoaded])

  useImperativeHandle(ref, () => ({
    flyToLocation: (lat: number, lon: number, zoom = 17, pitch = 45) => {
      if (map.current) {
        map.current.flyTo({
          center: [lon, lat],
          zoom: zoom,
          pitch: pitch,
          bearing: 0,
          duration: 2500,
          essential: true,
        })
      }
    },
  }))

  if (isCheckingToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#ebfaff]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056b3] mx-auto mb-4"></div>
          <p className="text-sm text-[#6a7a94]">Validating Mapbox configuration...</p>
        </div>
      </div>
    )
  }

  if (error || !tokenValidated) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#ebfaff] p-8">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-[#2c3e50] mb-2">Map Configuration Required</h3>
          <p className="text-sm text-[#6a7a94] mb-4">{error || "Mapbox token is not configured"}</p>
          <div className="text-xs text-left bg-white p-4 rounded-lg shadow-sm">
            <p className="font-semibold mb-2">To enable the map:</p>
            <ol className="list-decimal list-inside space-y-1 text-[#6a7a94]">
              <li>
                Get a free token from{" "}
                <a
                  href="https://mapbox.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0056b3] hover:underline"
                >
                  mapbox.com
                </a>
              </li>
              <li>Add it to the "Vars" section in v0</li>
              <li>
                Set the variable name as: <code className="bg-gray-100 px-1 rounded">MAPBOX_ACCESS_TOKEN</code>
              </li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full rounded-xl" />

      {selectedEvent && (
        <div className="absolute top-4 right-4 w-80 z-10">
          <Card className="p-4 bg-card border-border shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground text-lg">{selectedEvent.country}</h3>
                <p className="text-sm text-muted-foreground">Grade {selectedEvent.grade} Event</p>
              </div>
              <button onClick={() => onEventClick(null)} className="text-muted-foreground hover:text-foreground">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-xs text-muted-foreground">Disease</div>
                <div className="font-medium text-foreground">{selectedEvent.disease}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Event Type</div>
                <div className="font-medium text-foreground">{selectedEvent.eventType}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-border">
                <div>
                  <div className="text-xs text-muted-foreground">Cases</div>
                  <div className="text-xl font-bold text-foreground">{(selectedEvent.cases || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Deaths</div>
                  <div className="text-xl font-bold text-destructive">
                    {(selectedEvent.deaths || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-3 bg-card border-border">
          <h4 className="text-xs font-semibold text-foreground mb-2">Event Grade</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ff3355] border-2 border-white"></div>
              <span className="text-xs text-foreground">Grade 3 - High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ff9933] border-2 border-white"></div>
              <span className="text-xs text-foreground">Grade 2 - Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ffcc00] border-2 border-white"></div>
              <span className="text-xs text-foreground">Grade 1 - Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#a0a0b0] border-2 border-white"></div>
              <span className="text-xs text-foreground">Ungraded</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
})

MapboxMap.displayName = "MapboxMap"

export default MapboxMap
