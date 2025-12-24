# WHO Signal Intelligence Platform - Quick Start

## 🎯 5-Step Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create `.env.local` file:

```bash
# Azure OpenAI (for AI-powered outbreak analysis)
AZURE_OPENAI_API_KEY=your_azure_key_here

# WHO Data Source (Google Sheets)
NEXT_PUBLIC_WHO_DATA_URL=https://docs.google.com/spreadsheets/d/e/2PACX-1vS-8N_ALP4IX8k7sFPRzdeALWNNeYpOMmGpbVC3V-nfAyvHsa0ZB6I2YFgONi4McA

# Azure PostgreSQL Database
POSTGRES_HOST=afro-server.postgres.database.azure.com
POSTGRES_PORT=5432
POSTGRES_DATABASE=who_afro_db
POSTGRES_USER=dunoamtpmx
POSTGRES_PASSWORD=your_postgres_password_here

# Mapbox (for interactive maps)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
```

**Get Your Keys:**
- **Azure OpenAI**: [Azure Portal](https://portal.azure.com) → afro-ai-resource → Keys and Endpoint → Copy Key 1
- **PostgreSQL Password**: Contact your Azure administrator or check Azure Portal
- **Google Sheets**: The URL is already configured for WHO AFRO data
- **Mapbox**: [Mapbox Account](https://account.mapbox.com/access-tokens/) → Create token

### Step 3: Verify Database Connection

The PostgreSQL database will automatically:
- Create required tables on first run
- Cache WHO outbreak data for 5 minutes
- Provide fallback data if Google Sheets is unavailable

### Step 4: Test Azure OpenAI

```bash
# Test Azure OpenAI connection (optional)
npm run test:azure
```

Expected output:
```
✅ Azure OpenAI configured correctly
✅ Connected to AFRO-AI deployment
✅ Model: gpt-4o-mini-2024-07-18 (fine-tuned)
```

### Step 5: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📊 Data Source Information

The dashboard fetches data from:
- **Primary**: Google Sheets XLSX (WHO AFRO emergency data)
- **Cache**: Azure PostgreSQL (5-minute cache)
- **Fallback**: Static data if external sources fail

**Automatic Features:**
- Data refreshes every 5 minutes
- Database tables created automatically
- Three-tier fallback system for reliability

---

## 🤖 AI Features

The dashboard uses **Azure OpenAI AFRO-AI** deployment (fine-tuned GPT-4o-mini) for:

1. **Outbreak Analysis**
   - Risk scoring (0-100)
   - Alert level classification
   - Key findings extraction

2. **Anomaly Detection**
   - Spike detection (>50% increase)
   - Geographic spread patterns
   - CFR deviations

3. **Intelligent Alerts**
   - Automatic alert generation every 5 minutes
   - Affected countries identification
   - Actionable recommendations

**AI Monitoring runs automatically when the app starts.**

---

## ✅ Verify Everything Works

### 1. Check Browser Console (F12)

Look for:
```
✅ [v0] API response: { success: true, data: [...], source: "database" }
✅ [v0] Running AI analysis on 20 events
✅ [v0] AI Analysis complete: { analysis: {...}, anomalies: {...} }
```

### 2. Check the Dashboard

- ✅ Map markers appear showing outbreak locations
- ✅ Metric cards show real data (Total Events, New, Ongoing, etc.)
- ✅ Filters work (Grade, Country, Disease)
- ✅ AI alerts appear (check notification bell icon)
- ✅ Country flags visible in right sidebar

### 3. Check Database

The PostgreSQL database should have:
- `who_events` table with outbreak data
- `data_sync_metadata` table with sync history

---

## 🔧 Troubleshooting

### Data Not Loading?

**Issue:** Map is empty, no events showing
**Solution:**
1. Check `NEXT_PUBLIC_WHO_DATA_URL` is set correctly
2. Verify PostgreSQL connection (host, port, password)
3. Check browser console for errors
4. Try manual refresh button in header

### AI Not Working?

**Issue:** No AI alerts appearing
**Solution:**
1. Verify `AZURE_OPENAI_API_KEY` in environment variables
2. Deployment name should be `AFRO-AI` (not gpt-4o)
3. Check console for "[v0] AI analysis error"
4. Verify Azure OpenAI has not hit rate limits

### Map Not Showing?

**Issue:** Blank map or "Invalid token" error
**Solution:**
1. Verify `NEXT_PUBLIC_MAPBOX_TOKEN` starts with `pk.`
2. Check token is valid at [Mapbox Account](https://account.mapbox.com)
3. Token must have proper scopes enabled

### Database Connection Failed?

**Issue:** "Failed to connect to database"
**Solution:**
1. Verify all `POSTGRES_*` variables are set correctly
2. Check Azure PostgreSQL server is running
3. Confirm firewall rules allow connections
4. Test connection from Azure portal

### Google Sheets Access Denied?

**Issue:** "Failed to fetch data: 307" or "403 Forbidden"
**Solution:**
1. Ensure sheet is shared publicly or with your account
2. Check the URL includes `/export?format=xlsx` parameter
3. The API route automatically appends this parameter

---

## 📖 Full Documentation

- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Complete environment variable details
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions

---

## 🎉 Success Checklist

Once running, you should see:
- ✅ Live outbreak data from WHO AFRO
- ✅ Interactive map with event markers
- ✅ Real-time AI analysis running every 5 minutes
- ✅ Metrics showing Total Events, New, Ongoing, Outbreaks, Protracted
- ✅ Filters for Grade, Country, Disease, Event Type
- ✅ Search functionality
- ✅ Export to PDF, Excel, CSV
- ✅ Country flags in right sidebar
- ✅ AI-generated alerts for critical situations

**Data updates automatically every 5 minutes.**

---

## 🚀 Deploy to Production

### Using Vercel

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add all environment variables in Vercel project settings
4. Deploy

### Environment Variables for Production

Make sure to add these in Vercel:
- `AZURE_OPENAI_API_KEY`
- `NEXT_PUBLIC_WHO_DATA_URL`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DATABASE`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `MAPBOX_ACCESS_TOKEN`

**Note:** The application is configured to work with Azure resources in the `EPROSL-P-EUW-RG01` resource group.

---

## 💡 Pro Tips

1. **Monitor AI Analysis**: Check browser console to see AI analysis results
2. **Export Reports**: Use the export feature to generate WHO-formatted reports
3. **Custom Filters**: Save filter presets for quick access
4. **Dark Mode**: Toggle dark theme for different viewing preferences
5. **Notifications**: Enable browser notifications for critical alerts

---

Need help? Check the full documentation or contact your system administrator.
