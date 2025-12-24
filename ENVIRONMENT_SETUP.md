# Environment Setup Guide

## Required Environment Variables

This WHO Signal Intelligence Dashboard requires several environment variables to function properly. Follow these steps to configure your environment.

### 1. Azure OpenAI Configuration

The app uses Azure OpenAI GPT-4o for AI-powered outbreak analysis and signal detection.

**Required:**
- `AZURE_OPENAI_API_KEY` - Your Azure OpenAI API key

**Configuration:**
```bash
AZURE_OPENAI_API_KEY=your_actual_api_key_here
```

**How to get your API key:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to your Azure OpenAI resource: `afro-ai-resource`
3. Go to "Keys and Endpoint"
4. Copy Key 1 or Key 2

**Endpoint Details:**
- Resource: `afro-ai-resource`
- AI Services Endpoint: `https://afro-ai-resource.services.ai.azure.com/`
- OpenAI Endpoint: `https://afro-ai-resource.openai.azure.com/`
- Deployment: `gpt-4o`
- Region: `West Europe`
- API Version: `2025-01-01-preview`

### 2. WHO Data Source

The dashboard fetches outbreak data from WHO AFRO emergency data portal.

**Required:**
- `NEXT_PUBLIC_WHO_DATA_URL` - URL to the WHO xlsx data file

**Configuration:**
```bash
NEXT_PUBLIC_WHO_DATA_URL=https://emergencydata.afro.who.int/data/latest.xlsx
```

**Note:** The `NEXT_PUBLIC_` prefix makes this variable accessible on the client side.

### 3. Mapbox Configuration

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

### 4. Setup Instructions

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

#### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - `AZURE_OPENAI_API_KEY`
   - `NEXT_PUBLIC_WHO_DATA_URL`
   - `NEXT_PUBLIC_MAPBOX_TOKEN`
   - `MAPBOX_ACCESS_TOKEN`

4. Redeploy your application

### 5. WHO AI Training System

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

### 6. Data Sources Monitored

The AI system monitors these WHO AFRO data sources:

1. **PowerBI Dashboard** - Real-time outbreak dashboard
2. **Emergency Data Portal** - Emergency health data and analytics
3. **GeoHEMP** - Geographic health event mapping
4. **EIOS** - Epidemic intelligence from open sources
5. **Disease Outbreaks** - Official outbreak information
6. **Sway Reports** - Interactive health reports

### 7. AI Features

When properly configured, the AI system provides:

- **Automatic outbreak analysis** - Every 2 minutes
- **Risk scoring** - 0-100 based on WHO standards
- **Alert generation** - Critical, High, Medium, Low levels
- **Chatbot assistance** - Natural language queries about outbreaks
- **Trend analysis** - Geographic and temporal patterns
- **Recommendations** - Actionable response guidance

### 8. Troubleshooting

**Issue: "AI monitoring error"**
- Check that `AZURE_OPENAI_API_KEY` is set correctly
- Verify the key has access to the `gpt-4o` deployment
- Check Azure OpenAI service is not rate limited

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

### 9. Security Best Practices

- **Never commit** `.env.local` to version control
- Use `.gitignore` to exclude environment files
- Rotate API keys regularly
- Use separate keys for development and production
- Limit key permissions to required services only

### 10. Support

For additional help:
- Azure OpenAI: [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
- WHO Data: Contact WHO AFRO emergency data team
- Mapbox: [Mapbox Documentation](https://docs.mapbox.com/)
