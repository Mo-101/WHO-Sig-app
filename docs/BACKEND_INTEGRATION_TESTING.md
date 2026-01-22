# Backend Integration Testing Guide

## Overview
This document provides comprehensive testing instructions for the backend signal integration in the WHO Outbreak Monitoring Dashboard.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│         Next.js Frontend (Dashboard)             │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐ │
│  │ App Pages & Components                      │ │
│  ├─────────────────────────────────────────────┤ │
│  │ - app/page.tsx (Main Dashboard)             │ │
│  │ - components/recent-signals.tsx (New)       │ │
│  │ - components/auto-detection-popup.tsx (New) │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │ API Routes                                  │ │
│  ├─────────────────────────────────────────────┤ │
│  │ - /api/who-data (Google Sheets)             │ │
│  │ - /api/backend-signals (Backend Signals) ✓  │ │
│  │ - /api/backend-assistant (AI Queries) ✓     │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │ Hooks & Libraries                           │ │
│  ├─────────────────────────────────────────────┤ │
│  │ - hooks/use-backend-signals.ts (New) ✓      │ │
│  │ - lib/backend-client.ts ✓                   │ │
│  │ - lib/backend-types.ts ✓                    │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │ HTTP/FETCH
┌──────────────────▼──────────────────────────────┐
│      FastAPI Backend (Python)                    │
├──────────────────────────────────────────────────┤
│ /signals - Get signals with pagination           │
│ /signals/latest - Get latest signals             │
│ /assistant/ask - AI-powered queries              │
│ /ingest/google-sheet - Trigger sheet sync        │
│ /health - Health check endpoint                  │
└──────────────────┬───────────────────────────────┘
                   │
┌──────────────────▼───────────────────────────────┐
│      PostgreSQL Database                         │
├──────────────────────────────────────────────────┤
│ Signals Table, Verification Data, etc.           │
└──────────────────────────────────────────────────┘
```

## Where Backend Integration Shows Up in UI

### 1. **Right Sidebar - Recent Signals** ✓ ADDED
- **Location**: Fixed to right, below filters
- **Component**: `RecentSignals` component
- **Displays**:
  - Last 10 backend signals
  - Source information for each signal
  - Signal text/description
  - Report date
  - Source badge (Backend Signal, etc.)
- **Interactions**:
  - Click to view signal details
  - Auto-updates every 60 seconds

### 2. **Auto Detection Popups** ✓ ADDED
- **Location**: Bottom right corner of screen
- **Component**: `AutoDetectionPopup` component
- **Triggers For**:
  - Anomaly detection in signal data
  - Sudden surge in cases
  - Trend changes
  - High-risk alerts
- **Shows**:
  - Alert type (Anomaly/Surge/Trend)
  - Severity level (Critical/High/Medium/Low)
  - Affected countries/regions
  - Source information
  - Metric changes
- **Dismissible**: User can close or view details

### 3. **Main Dashboard Integration**
- **Location**: App.page.tsx
- **Features**:
  - Fetches backend signals via `useBackendSignals` hook
  - Displays signals in recent signals panel
  - Shows auto-detection popups when anomalies found
  - Merges with Google Sheets data

## Setup & Configuration

### Environment Variables Required
```env
# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000  # or your production URL
```

### Backend Requirements
Your FastAPI backend should have:
```python
GET /signals?limit=100&offset=0
  Query params: limit, offset, Country, Signal, Source, Admin1
  Response: { total, limit, offset, items: [{ id, signal_id, source, text, created_at, raw }] }

GET /signals/latest?limit=10
  Response: { items: [BackendSignal] }

POST /assistant/ask
  Body: { question, tab, ui_context }
  Response: { answer, plan, count, preview, found, status }

POST /ingest/google-sheet
  Response: { ok, inserted, updated, deleted, error }

GET /health
  Response: { status, version }
```

## Testing Plan

### Phase 1: Backend Connection Test
```bash
# 1. Verify backend is running
curl http://localhost:8000/health

# 2. Check signals endpoint
curl 'http://localhost:8000/signals?limit=10'

# 3. Check latest signals
curl 'http://localhost:8000/signals/latest?limit=5'
```

### Phase 2: Frontend Integration Test

#### Test 1: Recent Signals Display
1. Open dashboard at `http://localhost:3000`
2. Check right sidebar for "Recent Signals" section
3. Verify signals are loading (should see loading state, then signals)
4. Verify source information is displayed for each signal
5. Click on a signal to view details

#### Test 2: Auto Detection Popup
1. Keep dashboard open
2. Check for auto-detection popups (bottom right)
3. Verify popup shows:
   - Alert type and title
   - Severity color coding
   - Affected countries
   - Source attribution
4. Test dismiss functionality
5. Test "View Details" button

#### Test 3: Data Freshness
1. Monitor right sidebar
2. Wait 60+ seconds
3. Verify signals auto-refresh with latest data
4. Check timestamp updates

### Phase 3: Backend Fallback Testing

#### Test 3a: Backend Unavailable
1. Stop FastAPI backend
2. Reload dashboard
3. Verify graceful fallback to Google Sheets data
4. Check console logs for error messages
5. Verify no UI breaks

#### Test 3b: Backend Slow Response
1. Simulate delay with network throttling
2. Verify loading state shows in Recent Signals
3. Verify UI doesn't hang/freeze
4. Check timeout handling

### Phase 4: Data Accuracy Testing

#### Test 4a: Signal Filtering
1. Open dashboard
2. Apply filters (Grade, Country, Disease)
3. Verify filtered signals match criteria
4. Test multiple filter combinations

#### Test 4b: Event Merging
1. Monitor total event count
2. Verify Google Sheets events + Backend Signals = Total
3. Check for duplicate IDs
4. Verify no data loss

## Debugging

### Enable Debug Logs
Add to `app/page.tsx`:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('[v0] Backend signals:', backendSignals)
  console.log('[v0] Auto detections:', backendDetections)
}
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Filter for "backend-signals"
4. Check request/response:
   ```json
   {
     "total": 10,
     "limit": 10,
     "offset": 0,
     "items": [
       {
         "id": 1,
         "signal_id": "SIG-001",
         "source": "Backend Signal",
         "text": "...",
         "created_at": "2025-01-22T...",
         "raw": {...}
       }
     ]
   }
   ```

### Common Issues & Solutions

**Issue**: Recent Signals not showing
- Check if `NEXT_PUBLIC_BACKEND_URL` is set
- Verify backend is running: `curl http://localhost:8000/health`
- Check browser console for errors
- Verify `/api/backend-signals` returns data

**Issue**: Auto-detection popups not appearing
- Check if detections are being generated
- Verify anomaly detection logic is triggered
- Check `showAutoPopups` state in app/page.tsx

**Issue**: Source information missing
- Verify backend response includes `source` field
- Check `signal.source` in `RecentSignals` component
- Ensure `raw` field contains country/grade data

## API Response Examples

### Backend Signals Response
```json
{
  "total": 250,
  "limit": 10,
  "offset": 0,
  "items": [
    {
      "id": 1,
      "signal_id": "SIG-20250122-001",
      "source": "ProMED-mail",
      "text": "Cholera suspected cases reported in Kenya",
      "created_at": "2025-01-22T10:30:00Z",
      "raw": {
        "country": "Kenya",
        "lat": -0.3667,
        "lon": 36.6833,
        "grade": "Grade 2",
        "cases": 15,
        "deaths": 2
      }
    }
  ]
}
```

### Auto-Detection Data
```json
{
  "type": "surge",
  "severity": "high",
  "title": "Case Surge Detected",
  "description": "30% increase in malaria cases in Tanzania",
  "affected": ["Tanzania"],
  "metric": "Malaria Cases",
  "change": 30,
  "source": "Backend Analytics"
}
```

## Performance Metrics

- **Recent Signals Load Time**: < 2s
- **Auto-detection Delay**: < 1s
- **Backend Response Time**: < 500ms (avg)
- **Memory Usage**: < 50MB additional

## Success Criteria

✓ Recent signals display in right sidebar
✓ Source information is visible for each signal
✓ Auto-detection popups appear for anomalies
✓ Signals auto-refresh every 60 seconds
✓ Graceful fallback to Google Sheets if backend unavailable
✓ No UI breaks or errors in console
✓ Performance metrics met
✓ Data accuracy verified
