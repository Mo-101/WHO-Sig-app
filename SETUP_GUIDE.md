# WHO Signal Intelligence Platform - Complete Setup Guide

## 🚀 Quick Start

This guide will help you set up the WHO Signal Intelligence Dashboard with live data from Google Sheets and Azure AI-powered analysis.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Azure OpenAI API access (GPT-4o deployment)
- Google Sheets with WHO outbreak data
- Mapbox account (for maps)

---

## 🔧 Step 1: Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```bash
# =============================================================================
# AZURE OPENAI CONFIGURATION (REQUIRED FOR AI FEATURES)
# =============================================================================

# Get your API key from Azure Portal:
# 1. Go to https://portal.azure.com
# 2. Navigate to: afro-agents-resource > Keys and Endpoint
# 3. Copy Key 1 or Key 2

AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here

# Azure OpenAI Configuration Details:
# - Resource Name: afro-agents-resource
# - Endpoint: https://afro-agents-resource.openai.azure.com/
# - Deployment: gpt-4o
# - Model: gpt-4o and gpt-4o-mini
# - Region: West Europe
# - API Version: 2025-01-01-preview

# =============================================================================
# WHO DATA SOURCE (REQUIRED FOR LIVE DATA)
# =============================================================================

# Option 1: Google Sheets (Recommended)
# Export your Google Sheet as XLSX:
# 1. Open your Google Sheet
# 2. Get the sheet ID from the URL: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
# 3. Use the export URL format below:

NEXT_PUBLIC_WHO_DATA_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=xlsx

# Option 2: Direct XLSX URL
# If you have a direct link to an XLSX file:

# NEXT_PUBLIC_WHO_DATA_URL=https://emergencydata.afro.who.int/data/latest.xlsx

# Option 3: Local or custom server
# NEXT_PUBLIC_WHO_DATA_URL=https://your-server.com/data/who-outbreaks.xlsx

# =============================================================================
# MAPBOX CONFIGURATION (REQUIRED FOR MAPS)
# =============================================================================

# Get your free Mapbox token at: https://account.mapbox.com/access-tokens/
# See .env.local.example for configuration details

NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here

```

---

## 📊 Step 2: Prepare Your Google Sheet

Your Google Sheet should contain WHO outbreak data with the following columns:

### Required Columns:

| Column Name | Type | Example | Description |
|------------|------|---------|-------------|
| `country` or `Country` | string | "Nigeria" | Country name |
| `disease` or `Disease` | string | "Cholera" | Disease name |
| `latitude` or `lat` | number | 9.0820 | Latitude coordinate |
| `longitude` or `lon` | number | 8.6753 | Longitude coordinate |
| `grade` or `Grade` | string | "Grade 3" | WHO grade (3, 2, 1, or Ungraded) |
| `status` or `Status` | string | "Ongoing" | Event status (New, Ongoing, Resolved) |
| `reportDate` or `Report Date` | date | "2025-12-15" | Report date (YYYY-MM-DD) |

### Optional Columns:

| Column Name | Type | Example | Description |
|------------|------|---------|-------------|
| `cases` or `Cases` | number | 1500 | Total case count |
| `deaths` or `Deaths` | number | 45 | Total death count |
| `eventType` or `Event Type` | string | "Outbreak" | Event type |
| `description` or `Description` | string | "..." | Event description |
| `protracted` or `Protracted` | string | "Protracted-1" | Protracted level (1, 2, or 3) |
| `year` or `Year` | number | 2025 | Year |
| `id` or `ID` | string | "event-001" | Unique identifier |

### Column Name Variations Supported:

The system automatically detects multiple column name variations:
- **Country**: `country`, `Country`, `COUNTRY`, `Country_Name`, `Country Name`, `Location`
- **Disease**: `disease`, `Disease`, `DISEASE`, `Disease_Name`, `Disease Name`, `Pathogen`
- **Latitude**: `latitude`, `Latitude`, `LATITUDE`, `lat`, `Lat`, `Latitude_Decimal`
- **Longitude**: `longitude`, `Longitude`, `LONGITUDE`, `lon`, `Lon`, `Longitude_Decimal`
- **Grade**: `grade`, `Grade`, `GRADE`, `Grading`, `Grade Level`, `Risk_Level`
- **Cases**: `cases`, `Cases`, `CASES`, `Total_Cases`, `Total Cases`, `Case_Count`
- **Deaths**: `deaths`, `Deaths`, `DEATHS`, `Total_Deaths`, `Total Deaths`, `Death_Count`

### Example Google Sheet Structure:

```
| Country  | Disease    | Grade   | Status  | Cases | Deaths | Latitude | Longitude | Report Date |
|----------|------------|---------|---------|-------|--------|----------|-----------|-------------|
| Nigeria  | Cholera    | Grade 3 | Ongoing | 1500  | 45     | 9.0820   | 8.6753    | 2025-12-15  |
| Kenya    | Mpox       | Grade 2 | New     | 234   | 12     | -1.2921  | 36.8219   | 2025-12-18  |
| Ghana    | Measles    | Grade 1 | Ongoing | 89    | 3      | 7.9465   | -1.0232   | 2025-12-10  |
```

### Multiple Sheets Support:

The system can read **all sheets** in your Google Sheets workbook and combine them automatically. Name your sheets descriptively:
- `Grade 3 Events`
- `Grade 2 Events`
- `December 2025`
- `Protracted Outbreaks`
- etc.

### Google Sheets Sharing Settings:

**Important:** Make sure your Google Sheet is accessible:

1. Click "Share" button in Google Sheets
2. Change access to "Anyone with the link can view"
3. Or set specific permissions for your domain

---

## 🛠️ Step 3: Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

---

## 🚀 Step 4: Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## ✅ Step 5: Verify Everything Works

### Check Data Loading:

1. Open browser console (F12)
2. Look for log messages:
   ```
   [v0] Fetching WHO data from API route...
   [v0] Workbook sheets: Sheet1, Grade 3 Events, ...
   [v0] Successfully parsed X total events from all sheets
   [v0] Received X events from API
   ```

3. Verify no error messages appear

### Check AI Analysis:

1. Look for AI monitoring logs:
   ```
   [v0] AI monitoring active - analyzing WHO outbreak data...
   ```

2. Check for AI-generated alerts in the notification bell icon (top right)

### Check Map Display:

1. Verify outbreak markers appear on the map
2. Click markers to see event details
3. Check that map zooms and pans correctly

---

## 🔍 Troubleshooting

### Data Not Loading:

**Error:** "Failed to fetch WHO data"

**Solutions:**
1. Check that `NEXT_PUBLIC_WHO_DATA_URL` is set correctly in `.env.local`
2. Verify Google Sheet is shared publicly ("Anyone with the link")
3. Check browser console for specific error messages
4. Try accessing the URL directly in your browser to verify it downloads an XLSX file

### Azure OpenAI Errors:

**Error:** "Azure OpenAI API error" or AI features not working

**Solutions:**
1. Verify `AZURE_OPENAI_API_KEY` is set correctly in `.env.local`
2. Check API key is valid in Azure Portal
3. Ensure you have quota/credits available
4. Verify the deployment name is `gpt-4o`
5. Check network connectivity to Azure

### Map Not Displaying:

**Error:** Map is blank or shows error

**Solutions:**
1. Check Mapbox token configuration in environment variables
2. Verify token is valid at https://account.mapbox.com/
3. Ensure latitude/longitude values in your data are valid (-90 to 90, -180 to 180)

### CORS Errors:

**Error:** "Cross-Origin Request Blocked"

**Solutions:**
- The API route (`/api/who-data`) automatically handles CORS
- If still seeing errors, check that you're using the API route (not direct XLSX fetch)
- Clear browser cache and restart dev server

### Build Errors:

**Error:** Build fails with module errors

**Solutions:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📦 Data Flow Architecture

```
Google Sheets (XLSX)
    ↓
Next.js API Route (/api/who-data)
    ↓
XLSX Parser (reads all sheets)
    ↓
Data Validation (Zod schema)
    ↓
React State (whoEvents)
    ↓
Azure OpenAI Analysis
    ↓
UI Components (Map, Charts, Metrics)
```

---

## 🧪 Testing Your Setup

### Test 1: Data Fetching
```bash
# Open browser console and run:
fetch('/api/who-data').then(r => r.json()).then(console.log)

# Expected output:
# { success: true, data: [...], metadata: {...} }
```

### Test 2: Azure OpenAI
The AI will automatically analyze data every 2-5 minutes. Check the browser console for:
```
[v0] AI monitoring active - analyzing WHO outbreak data...
```

### Test 3: Map Rendering
1. Data should appear on map as colored markers
2. Grade 3 = Red, Grade 2 = Orange, Grade 1 = Yellow
3. Click markers to see event details

---

## 🔐 Security Notes

1. **Never commit `.env.local` to git** (already in .gitignore)
2. **Keep Azure API keys secret** - rotate them regularly
3. **Use environment variables** for all sensitive data
4. **Restrict Mapbox token** to specific URLs in production

---

## 🚢 Production Deployment

### Vercel (Recommended):

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `AZURE_OPENAI_API_KEY`
   - `NEXT_PUBLIC_WHO_DATA_URL`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
4. Deploy

### Other Platforms:

Ensure your platform supports:
- Next.js 14+ with App Router
- Server-side rendering (SSR)
- API routes
- Environment variables

---

## 📞 Support

If you encounter issues:

1. Check browser console for error messages
2. Review this setup guide
3. Verify all environment variables are set correctly
4. Check Google Sheet permissions
5. Verify Azure OpenAI API key and quota

---

## 🎉 Success!

Once everything is set up, you should see:
- ✅ Live outbreak data from your Google Sheet
- ✅ Interactive map with event markers
- ✅ Real-time AI analysis and alerts
- ✅ Metrics cards showing current statistics
- ✅ Filtering and search capabilities
- ✅ Export functionality (PDF, Excel, CSV)

The dashboard will automatically refresh data every 5 minutes and run AI analysis every 2-5 minutes.
