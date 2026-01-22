# Light/Dark Page Synchronization & Data Source Display

## Overview
All features from the light page have been synchronized with the dark page, and data source information is now prominently displayed throughout the application.

## Changes Made

### 1. Dark Page Synchronization (`app/dark/page.tsx`)
- ✅ Added `RecentSignals` component import and usage
- ✅ Added `AutoDetectionPopup` component for automatic alerts
- ✅ Added `useBackendSignals` hook for real-time signal fetching
- ✅ Added `MapErrorBoundary` wrapper to suppress Mapbox Headers errors
- ✅ Implemented backend signal polling (refreshes every 60 seconds)
- ✅ Split right sidebar into two sections:
  - "Recent Signals" (top) - Backend/ProMED/ECDC signals with source badges
  - "Country Signals" (bottom) - WHO Sheets data with source attribution

### 2. Data Source Display Enhancement

#### Recent Signals Component (`components/recent-signals.tsx`)
- Shows source-specific icons and colors:
  - 🟦 Backend DB (Blue)
  - 🟩 Google Sheets (Green)
  - 🟥 ProMED-mail (Red)
  - 🟨 ECDC (Yellow)
- Displays country and disease information
- Source badge on each signal card
- Click to view detailed information

#### Country Signals Section (Dark Page)
- Shows "📊 Google Sheets" source attribution for each event
- Flag icons for visual identification
- Event type and status information
- Linked to event details modal

#### Event Detail Modal (`components/event-detail-modal.tsx`)
- Added "Data Source" field in Event Information section
- Displays source with distinctive blue color (#009edb)
- Falls back to "Google Sheets" if not specified

### 3. Error Handling
- `MapErrorBoundary` suppresses non-critical Mapbox GL Header errors
- Graceful fallback when backend is unavailable
- Both pages now render correctly without console errors

### 4. Backend Integration
- `useBackendSignals` hook fetches latest signals from `/api/backend-signals`
- Automatic fallback to empty array if backend unavailable
- Polls every 60 seconds for new signals
- Graceful error handling with silent warnings

## Data Sources Configuration

### Priority Order
1. **Backend Signals Database** (if configured) - FastAPI PostgreSQL
2. **Google Sheets** - WHO AFRO signal data
3. **ProMED-mail** - Open source alerts
4. **ECDC** - Epidemic intelligence data

### Source Display Locations
- Right sidebar Recent Signals cards
- Event detail modal Information tab
- Country signals list
- Auto-detection popups

## Testing Checklist

### Light Page (`/`)
- ✅ Recent Signals showing with source badges
- ✅ Data sources visible in sidebar
- ✅ Event modal shows data source
- ✅ No Mapbox errors in console

### Dark Page (`/dark`)
- ✅ Recent Signals component displaying
- ✅ Country Signals section visible
- ✅ Both showing correct source information
- ✅ Auto-detection popups appearing
- ✅ No Mapbox errors in console

### Backend Integration
- ✅ Falls back gracefully when backend unavailable
- ✅ Shows Google Sheets data as primary source
- ✅ Displays correct source attribution
- ✅ All signals count correctly (20 events)

## Environment Variables
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (optional, defaults to localhost:8000)
- `NEXT_PUBLIC_WHO_DATA_URL` - Google Sheets data URL (required)
- `MAPBOX_ACCESS_TOKEN` - Mapbox token (required for map functionality)

## Notes
- All data sources are now consistently displayed across light and dark pages
- Error messages are suppressed but logged for debugging
- Backend signals update automatically every 60 seconds
- Graceful fallback ensures app works even if backend is unavailable
