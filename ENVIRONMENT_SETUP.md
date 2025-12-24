# Environment Setup Guide

## Required Environment Variables

This WHO Signal Intelligence Dashboard requires several environment variables to function properly. Follow these steps to configure your environment.

### 1. Azure OpenAI Configuration

The app uses Azure OpenAI fine-tuned GPT-4o-mini for AI-powered outbreak analysis and signal detection.

**Required:**
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key

**Configuration:**
```bash
AZURE_OPENAI_API_KEY=your_actual_api_key_here
```

**Azure OpenAI Deployment Details:**
- **Resource Name**: `afro-ai-resource`
- **Deployment Name**: `AFRO-AI`
- **Model**: `gpt-4o-mini-2024-07-18.ft-e36e576469364444822501faed26ec76` (Fine-tuned)
- **Base URL**: `https://afro-ai-resource.cognitiveservices.azure.com/`
- **Endpoint**: `https://afro-ai-resource.cognitiveservices.azure.com/openai/deployments/AFRO-AI/chat/completions?api-version=2024-12-01-preview`
- **API Version**: `2024-12-01-preview` or `2025-01-01-preview`
- **Rate Limits**: 500,000 tokens/min, 3,000 requests/min
- **Created**: Dec 24, 2025
- **Model Retirement**: Mar 31, 2027

**How to get your API key:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource: `afro-ai-resource`
3. Go to "Keys and Endpoint" section
4. Copy Key 1 or Key 2

**Using the API:**
The application automatically uses the AI SDK with Azure provider:
```typescript
import { createAzure } from "@ai-sdk/azure"

const azure = createAzure({
  resourceName: "afro-ai-resource",
  apiKey: process.env.AZURE_OPENAI_API_KEY || "",
})

const afroAI = azure("AFRO-AI")
```

### 2. WHO Data Source

The dashboard fetches outbreak data from WHO AFRO emergency data portal.

**Required:**
- `NEXT_PUBLIC_WHO_DATA_URL` - URL to the WHO xlsx data file

**Configuration:**
```bash
NEXT_PUBLIC_WHO_DATA_URL=https://docs.google.com/spreadsheets/d/e/2PACX-1vS-8N_ALP4IX8k7sFPRzdeALWNNeYpOMmGpbVC3V-nfAyvHsa0ZB6I2YFgONi4McA
```

**Note:** 
- The `NEXT_PUBLIC_` prefix makes this variable accessible on the client side.
- For Google Sheets URLs, the system automatically appends `/pub?output=xlsx` to download the file.
- Data is cached in PostgreSQL database for 5 minutes to improve performance.

### 3. PostgreSQL Database Configuration

The dashboard uses Azure PostgreSQL to cache WHO outbreak data for better performance and reliability.

**Required:**
- `POSTGRES_HOST` - PostgreSQL server hostname
- `POSTGRES_PORT` - PostgreSQL port (default: 5432)
- `POSTGRES_DATABASE` - Database name
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password

**Configuration:**
```bash
POSTGRES_HOST=afro-server.postgres.database.azure.com
POSTGRES_PORT=5432
POSTGRES_DATABASE=who_afro_db
POSTGRES_USER=dunoamtpmx
POSTGRES_PASSWORD=your_postgres_password_here
```

**Azure PostgreSQL Details:**
- Resource: `afro-server`
- Resource Group: `EPROSL-P-EUW-RG01`
- Subscription: `AFRO Production Subscription` (8c247e8d-4f67-46e2-b10e-e89fc1a60fbd)
- Location: `West Europe`
- Version: `PostgreSQL 14`
- SKU: `Standard_D2s_v3` (GeneralPurpose)
- Storage: 128 GB

**Database Features:**
- Automatic table creation on first run
- Caches WHO outbreak data for 5 minutes
- Three-tier fallback system (DB cache → static data → error handling)
- Tracks data sync metadata and history
- Indexes on country, disease, grade, date for fast queries

**How to get database credentials:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to resource: `afro-server` in `EPROSL-P-EUW-RG01`
3. Go to "Connection strings" or "Settings"
4. Copy the connection details

### 4. Mapbox Configuration

For map visualization of outbreak locations.

**Required:**
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Your Mapbox public access token
- `MAPBOX_ACCESS_TOKEN` - Same token (for server-side usage)

**Configuration:**
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...your_token_here
MAPBOX_ACCESS_TOKEN=pk.eyJ1...your_token_here
```

**How to get Mapbox token:**
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Create an account or sign in
3. Go to "Access tokens"
4. Create a new token or use the default public token

### 5. Setup Instructions

#### For Development (Local)

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your actual values:
   ```bash
   nano .env.local
   # or
   code .env.local
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

**Note:** Database tables will be created automatically on first API call.

#### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - `AZURE_OPENAI_API_KEY`
   - `NEXT_PUBLIC_WHO_DATA_URL`
   - `POSTGRES_HOST`
   - `POSTGRES_PORT`
   - `POSTGRES_DATABASE`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `MAPBOX_ACCESS_TOKEN`

4. Redeploy your application

### 6. WHO AI Training System

The app includes a specialized WHO Public Health AI training system with:

**System Prompt:**
- Mission-critical health signal detection
- African region context awareness
- Epidemiological expertise
- Policy advisory capabilities

**Training Examples:**
- Cholera, TB, Yellow Fever signal analysis
- Multi-source outbreak detection
- Risk assessment frameworks
- Cross-border transmission patterns

**Analysis Framework:**
- Signal detection and classification
- Risk grading (Grade 0-3)
- Response prioritization
- Evidence quality assessment
- WHO-standard terminology

### 7. Data Sources Monitored

The AI system monitors these WHO AFRO data sources:

1. **PowerBI Dashboard** - Real-time outbreak dashboard
2. **Emergency Data Portal** - Emergency health data and analytics
3. **GeoHEMP** - Geographic health event mapping
4. **EIOS** - Epidemic intelligence from open sources
5. **Disease Outbreaks** - Official outbreak information
6. **Sway Reports** - Interactive health reports

### 8. Troubleshooting

**Issue: "AI monitoring error"**
- Check that `AZURE_OPENAI_API_KEY` is set correctly in environment variables
- Verify the key has access to the `AFRO-AI` deployment (not gpt-4o)
- Check Azure OpenAI service is not rate limited (500K tokens/min, 3K requests/min)
- Confirm API version is `2024-12-01-preview` or `2025-01-01-preview`
- Verify the fine-tuned model `gpt-4o-mini-2024-07-18.ft-e36e576469364444822501faed26ec76` is deployed

**Issue: "Invalid API endpoint"**
- The application uses `https://afro-ai-resource.cognitiveservices.azure.com/` as base URL
- Deployment name should be `AFRO-AI` (not gpt-4o or gpt-4o-mini)
- The AI SDK handles URL construction automatically

**Issue: "Failed to load WHO outbreak data"**
- Verify `NEXT_PUBLIC_WHO_DATA_URL` is accessible
- Check network connectivity
- Ensure xlsx file format is compatible

**Issue: "Mapbox map not loading"**
- Confirm `NEXT_PUBLIC_MAPBOX_TOKEN` starts with `pk.`
- Check token is valid and not expired
- Verify token has proper scopes enabled

**Issue: "No AI alerts appearing"**
- AI generates alerts based on outbreak severity
- Check console logs for AI analysis status
- Verify sufficient outbreak data exists
- Alerts appear every 2 minutes if conditions met

**Issue: "Database connection failed"**
- Check PostgreSQL credentials are correct
- Verify the Azure PostgreSQL server is running
- Confirm network access (firewall rules allow connections)
- Check if using private network (VNet integration required)
- Verify SSL certificate settings

**Issue: "Data not updating"**
- Database cache refreshes every 5 minutes
- Check `data_sync_metadata` table for last sync status
- Verify Google Sheets URL is accessible
- Check API logs for fetch errors

### 9. Security Best Practices

- **Never commit** `.env.local` to version control
- Use `.gitignore` to exclude environment files
- Rotate API keys regularly
- Use separate keys for development and production
- Limit key permissions to required services only

### 10. Data Flow Architecture

**Data Fetching Flow:**
```
Google Sheets XLSX URL
    ↓ (Every 5 minutes)
Next.js API Route (/api/who-data)
    ↓ (Parse XLSX with xlsx library)
PostgreSQL Database (afro-server)
    ↓ (Cache for 5 minutes)
Frontend (SWR hook)
    ↓
UI Components (Maps, Charts, Lists)
```

**Fallback Strategy:**
1. Try fetching from Google Sheets
2. If fails → Use PostgreSQL cached data
3. If no cache → Use static fallback data
4. If all fail → Show error with retry

**Database Tables:**
- `who_events` - Cached outbreak event data
- `data_sync_metadata` - Sync history and status

### 11. Support

For additional help:
- Azure OpenAI: [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
- WHO Data: Contact WHO AFRO emergency data team
- Mapbox: [Mapbox Documentation](https://docs.mapbox.com/)
