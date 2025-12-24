# WHO Signal Intelligence Platform - Quick Start

## 🎯 3-Step Setup (5 Minutes)

### Step 1: Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Step 2: Configure Environment Variables

Create `.env.local` file:

\`\`\`bash
# Azure OpenAI (for AI features)
AZURE_OPENAI_API_KEY=your_key_here

# Google Sheets Data Source
NEXT_PUBLIC_WHO_DATA_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=xlsx

# Mapbox (for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
\`\`\`

**Get Your Keys:**
- **Azure OpenAI**: [Azure Portal](https://portal.azure.com) → afro-ai-resource → Keys and Endpoint
- **Google Sheets**: Share your sheet → "Anyone with link can view" → Get sheet ID from URL
- **Mapbox**: [Mapbox Account](https://account.mapbox.com/access-tokens/)

### Step 3: Test & Run

\`\`\`bash
# Test your setup
npm run test:data   # Test data source connection
npm run test:azure  # Test Azure OpenAI

# Run the app
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Google Sheet Requirements

Your Google Sheet should have these columns:

**Required:**
- `country` - Country name
- `disease` - Disease name
- `latitude` - Latitude (-90 to 90)
- `longitude` - Longitude (-180 to 180)
- `grade` - WHO grade (Grade 3, Grade 2, Grade 1, or Ungraded)

**Optional:**
- `cases` - Number of cases
- `deaths` - Number of deaths
- `status` - Event status (New, Ongoing, Resolved)
- `reportDate` - Report date (YYYY-MM-DD)
- `description` - Event description

**Example:**

| Country | Disease | Grade | Latitude | Longitude | Cases | Deaths | Status | Report Date |
|---------|---------|-------|----------|-----------|-------|--------|--------|-------------|
| Nigeria | Cholera | Grade 3 | 9.0820 | 8.6753 | 1500 | 45 | Ongoing | 2025-12-15 |

---

## ✅ Verify Everything Works

### 1. Check Browser Console (F12)

Look for:
\`\`\`
✅ [v0] Loaded 20 events from WHO xlsx data source
✅ [v0] AI monitoring active - analyzing WHO outbreak data...
\`\`\`

### 2. Check the Dashboard

- Map markers appear
- Metric cards show data
- Filters work
- AI alerts appear (notification bell icon)

---

## 🔧 Troubleshooting

### Data Not Loading?
\`\`\`bash
npm run test:data  # Test your data source
\`\`\`
- Verify Google Sheet is shared publicly
- Check sheet ID in URL is correct

### AI Not Working?
\`\`\`bash
npm run test:azure  # Test Azure OpenAI
\`\`\`
- Verify API key is correct
- Check you have quota/credits

### Map Not Showing?
- Verify Mapbox token in `.env.local`
- Check latitude/longitude values are valid

---

## 📖 Full Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Environment variables details

---

## 🎉 Success!

Once running, you'll see:
- ✅ Live outbreak data from your Google Sheet
- ✅ Interactive map with event markers
- ✅ Real-time AI analysis and alerts
- ✅ Metrics, filters, search, and export

Data refreshes every 5 minutes automatically.
