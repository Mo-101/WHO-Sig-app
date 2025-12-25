# Production Deployment Guide

## Critical Environment Variables

Set these in your Vercel/production environment:

### Database (Azure PostgreSQL)
```bash
DATABASE_URL="postgresql://avnadmin:AVNS_r3_b6ksDYyWTw54wPGf@afro-server.postgres.database.azure.com:5432/defaultdb?sslmode=require"
```

### Data Source (Google Sheets)
```bash
NEXT_PUBLIC_WHO_DATA_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vS-8N_ALP4IX8k7sFPRzdeALWNNeYpOMmGpbVC3V-nfAyvHsa0ZB6I2YFgONi4McA/pub?output=xlsx"
```

### Azure OpenAI (AI Analysis)
```bash
AZURE_OPENAI_API_KEY="your-azure-openai-key"
AZURE_OPENAI_ENDPOINT="https://afro-ai-resource.cognitiveservices.azure.com/"
AZURE_OPENAI_DEPLOYMENT_NAME="AFRO-AI"
```

### Mapbox (Maps)
```bash
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

## Deployment Steps

1. **Verify Database Connection**
   - Azure PostgreSQL must be accessible from your deployment environment
   - Check firewall rules allow connections from Vercel IPs
   - Test connection: `psql "postgresql://avnadmin:AVNS_r3_b6ksDYyWTw54wPGf@afro-server.postgres.database.azure.com:5432/defaultdb?sslmode=require"`

2. **Set Environment Variables**
   - Go to your Vercel project settings
   - Add all environment variables above
   - Redeploy after adding variables

3. **Verify Data Flow**
   - Check `/api/who-data` endpoint returns data
   - Verify database has records: `SELECT COUNT(*) FROM who_events;`
   - Check console logs for sync status

## Troubleshooting

### No Data Displaying
- Check DATABASE_URL is correct
- Verify database tables exist (auto-created on first request)
- Check Google Sheets URL is publicly accessible
- Look for errors in Vercel logs

### Mapbox Errors
- Verify NEXT_PUBLIC_MAPBOX_TOKEN is set correctly
- Token must start with `pk.`
- Check token is active in Mapbox dashboard

### AI Analysis Not Working
- Verify AZURE_OPENAI_API_KEY is correct
- Check deployment name matches "AFRO-AI"
- Ensure API version is compatible (2024-08-01-preview)

## System Architecture

```
Google Sheets (Public XLSX)
         ↓
    API Route (/api/who-data)
         ↓
    Azure PostgreSQL (Cache)
         ↓
    Frontend (Display)
         ↓
    Azure OpenAI (Analysis)
```

## Data Flow
1. Every 5 minutes, API checks for new data
2. Fetches from Google Sheets URL
3. Saves to Azure PostgreSQL database
4. Returns cached data to frontend
5. AI analysis runs on data every 5 minutes
6. Alerts displayed in notification center
