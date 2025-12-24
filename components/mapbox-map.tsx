"use client"

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react"
import { Card } from "@/components/ui/card"
import { getMapboxToken } from "@/lib/mapbox-config"

interface Event {
  id: string
  country: string
  lat: number
  lon: number
  disease: string
  grade: string
  eventType: string
  status: string
  description: string
  cases: number
  deaths: number
}

interface MapboxMapProps {
  events: Event[]
  mapStyle?: string
  selectedEvent?: Event | null
  setSelectedEvent: (event: Event | null) => void
}

export interface MapboxMapRef {
  flyToLocation: (lat: number, lon: number, zoom?: number, pitch?: number) => void
}

const MapboxMap = forwardRef<MapboxMapRef, MapboxMapProps>(
  ({ events, mapStyle, selectedEvent, setSelectedEvent }, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<any>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const markers = useRef<any[]>([])
    const selectedPopupRef = useRef<any>(null)

    useEffect(() => {
      if (typeof window === "undefined" || !mapContainer.current) return

      const initMap = async () => {
        try {
          const token = await getMapboxToken()

          if (
            !token ||
            token.trim() === "" ||
            token === "undefined" ||
            token === "null" ||
            token.length < 20 ||
            !token.startsWith("pk.")
          ) {
            console.error("[v0] Invalid Mapbox token")
            setError(
              "Mapbox token not configured properly. Please add a valid MAPBOX_ACCESS_TOKEN to your environment variables.",
            )
            return
          }

          const mapboxgl = (await import("mapbox-gl")).default

          mapboxgl.accessToken = token

          if (!map.current) {
            map.current = new mapboxgl.Map({
              container: mapContainer.current,
              style: mapStyle || "mapbox://styles/akanimo1/cld9l944e002g01oefypmh70y",
              center: [20, 0],
              zoom: 2,
              projection: "mercator",
            })

            map.current.on("load", () => {
              setMapLoaded(true)
            })

            map.current.on("error", (e: any) => {
              console.error("[v0] Mapbox error:", e)
              if (e.error && e.error.message && e.error.message.includes("token")) {
                setError("Invalid Mapbox token. Please verify your MAPBOX_ACCESS_TOKEN is correct.")
              } else {
                setError("Failed to load map. Please check your network connection and Mapbox token.")
              }
            })
          }
        } catch (err) {
          console.error("[v0] Map initialization error:", err)
          setError("Failed to initialize map. Please ensure MAPBOX_ACCESS_TOKEN is properly configured.")
        }
      }

      initMap()

      return () => {
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    }, [])

    useEffect(() => {
      if (!map.current || !mapLoaded) return

      const updateMarkers = async () => {
        const mapboxgl = (await import("mapbox-gl")).default

        // Remove existing markers
        markers.current.forEach((marker) => marker.remove())
        markers.current = []

        events.forEach((event) => {
          const el = document.createElement("div")
          el.className = "marker"
          el.style.width = "24px"
          el.style.height = "24px"
          el.style.borderRadius = "50%"
          el.style.cursor = "pointer"
          el.style.border = "2px solid white"
          el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)"

          // Color by grade matching WHO grade system
          const gradeColors: Record<string, string> = {
            "Grade 3": "#ff3355",
            "Grade 2": "#ff9933",
            "Grade 1": "#ffcc00",
            Ungraded: "#a0a0b0",
          }
          el.style.backgroundColor = gradeColors[event.grade] || "#a0a0b0"

          const marker = new mapboxgl.Marker(el).setLngLat([event.lon, event.lat]).addTo(map.current)

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            className: "mapbox-tooltip",
          }).setHTML(`
          <div style="padding: 10px; font-family: Inter, sans-serif; min-width: 200px;">
            <div style="font-size: 12px; font-weight: 700; color: #0056b3; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">${event.country}</div>
            <div style="font-size: 13px; font-weight: 600; color: #2c3e50; margin-bottom: 6px;">${event.disease}</div>
            <div style="font-size: 10px; color: #6a7a94; margin-bottom: 6px;">${event.eventType} • ${event.status}</div>
            <div style="font-size: 11px; color: #4a5a74; margin-bottom: 8px; line-height: 1.4;">${event.description.substring(0, 80)}...</div>
            <div style="display: flex; gap: 12px; margin-bottom: 8px; padding: 6px 0; border-top: 1px solid #e0e6ed; border-bottom: 1px solid #e0e6ed;">
              <div style="flex: 1;">
                <div style="font-size: 9px; color: #6a7a94; text-transform: uppercase;">Cases</div>
                <div style="font-size: 14px; font-weight: 700; color: #0056b3;">${(event.cases || 0).toLocaleString()}</div>
              </div>
              <div style="flex: 1;">
                <div style="font-size: 9px; color: #6a7a94; text-transform: uppercase;">Deaths</div>
                <div style="font-size: 14px; font-weight: 700; color: #ff3355;">${(event.deaths || 0).toLocaleString()}</div>
              </div>
            </div>
            <div style="display: inline-block; font-size: 9px; padding: 4px 8px; border-radius: 6px; background: ${gradeColors[event.grade]}22; color: ${gradeColors[event.grade]}; font-weight: 700; border: 1px solid ${gradeColors[event.grade]}44;">${event.grade}</div>
          </div>
        `)

          marker.setPopup(popup)

          el.addEventListener("mouseenter", () => {
            popup.addTo(map.current)
          })

          el.addEventListener("mouseleave", () => {
            popup.remove()
          })

          el.addEventListener("click", () => {
            setSelectedEvent(event)
          })

          markers.current.push(marker)
        })
      }

      updateMarkers()
    }, [events, mapLoaded])

    useEffect(() => {
      if (!map.current || !mapLoaded || !selectedEvent) {
        // Remove previous popup if no event selected
        if (selectedPopupRef.current) {
          selectedPopupRef.current.remove()
          selectedPopupRef.current = null
        }
        return
      }

      const showPersistentPopup = async () => {
        const mapboxgl = (await import("mapbox-gl")).default

        // Remove previous popup if exists
        if (selectedPopupRef.current) {
          selectedPopupRef.current.remove()
        }

        const gradeColors: Record<string, string> = {
          "Grade 3": "#ff3355",
          "Grade 2": "#ff9933",
          "Grade 1": "#ffcc00",
          Ungraded: "#a0a0b0",
        }

        // Create persistent popup with detailed event information
        selectedPopupRef.current = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          className: "mapbox-persistent-tooltip",
          maxWidth: "320px",
        })
          .setLngLat([selectedEvent.lon, selectedEvent.lat])
          .setHTML(`
          <div style="padding: 14px; font-family: Inter, sans-serif;">
            <div style="display: flex; align-items-start justify-between margin-bottom: 8px;">
              <div>
                <div style="font-size: 14px; font-weight: 700; color: #0056b3; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">${selectedEvent.country}</div>
                <div style="font-size: 15px; font-weight: 600; color: #2c3e50; margin-bottom: 6px;">${selectedEvent.disease}</div>
              </div>
              <div style="display: inline-block; font-size: 10px; padding: 5px 10px; border-radius: 8px; background: ${gradeColors[selectedEvent.grade]}22; color: ${gradeColors[selectedEvent.grade]}; font-weight: 700; border: 1.5px solid ${gradeColors[selectedEvent.grade]}44; white-space: nowrap;">${selectedEvent.grade}</div>
            </div>
            <div style="font-size: 11px; color: #6a7a94; margin-bottom: 8px; display: flex; gap: 8px;">
              <span>${selectedEvent.eventType}</span>
              <span>•</span>
              <span>${selectedEvent.status}</span>
            </div>
            <div style="font-size: 12px; color: #4a5a74; margin-bottom: 12px; line-height: 1.5; max-height: 80px; overflow-y: auto;">${selectedEvent.description}</div>
            <div style="display: flex; gap: 12px; margin-bottom: 10px; padding: 10px; border-radius: 8px; background: #f5f8fb;">
              <div style="flex: 1; text-align: center;">
                <div style="font-size: 10px; color: #6a7a94; text-transform: uppercase; margin-bottom: 4px;">Cases</div>
                <div style="font-size: 18px; font-weight: 700; color: #0056b3;">${(selectedEvent.cases || 0).toLocaleString()}</div>
              </div>
              <div style="width: 1px; background: #d1d9e6;"></div>
              <div style="flex: 1; text-align: center;">
                <div style="font-size: 10px; color: #6a7a94; text-transform: uppercase; margin-bottom: 4px;">Deaths</div>
                <div style="font-size: 18px; font-weight: 700; color: #ff3355;">${(selectedEvent.deaths || 0).toLocaleString()}</div>
              </div>
            </div>
            <div style="font-size: 10px; color: #6a7a94; text-align: center; padding-top: 8px; border-top: 1px solid #e0e6ed;">
              <svg style="display: inline-block; width: 12px; height: 12px; margin-right: 4px; vertical-align: middle;" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Location: ${selectedEvent.country} (${selectedEvent.lat.toFixed(4)}, ${selectedEvent.lon.toFixed(4)})
            </div>
          </div>
        `)
          .addTo(map.current)

        // Close popup when user clicks the X button
        selectedPopupRef.current.on("close", () => {
          selectedPopupRef.current = null
        })
      }

      showPersistentPopup()
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

    if (error) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#e8eef5]">
          <div className="bg-[#e8eef5] rounded-2xl neu-shadow p-6 max-w-md text-center">
            <svg
              className="w-12 h-12 mx-auto mb-4 text-[#ff3355]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-[#2c3e50] mb-2">Map Configuration Error</h3>
            <p className="text-sm text-[#6a7a94] mb-4">{error}</p>
            <div className="text-xs text-left bg-[#d1d9e6] p-3 rounded-lg">
              <p className="font-mono text-[#6a7a94] mb-2">Add your Mapbox token:</p>
              <ol className="list-decimal list-inside space-y-1 text-[#6a7a94]">
                <li>Click "Vars" in the left sidebar</li>
                <li>Add MAPBOX_ACCESS_TOKEN</li>
                <li>Get a free token at mapbox.com</li>
              </ol>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="relative w-full h-full overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full rounded-xl" />

        {/* Event Details Popup */}
        {selectedEvent && (
          <div className="absolute top-4 right-4 w-80 z-10">
            <Card className="p-4 bg-card border-border shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">{selectedEvent.country}</h3>
                  <p className="text-sm text-muted-foreground">Grade {selectedEvent.grade} Event</p>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-muted-foreground hover:text-foreground">
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
                    <div className="text-xl font-bold text-foreground">
                      {(selectedEvent.cases || 0).toLocaleString()}
                    </div>
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

        {/* Legend */}
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
  },
)

MapboxMap.displayName = "MapboxMap"

export default MapboxMap
