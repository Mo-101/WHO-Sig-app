# Vercel Deployment Checklist

## ✅ Issues Fixed
1. **Context Length Error**: Reduced AI prompt sizes to stay within 128k token limit
2. **Runtime Error**: Fixed AIAlertPopup component with safety checks and proper data structure
3. **Azure Connection**: Confirmed working with "AFRO-AI" deployment

## 🚀 Manual Deployment Steps

### 1. Push Changes to Git
```bash
git add .
git commit -m "Fix AI context length and runtime errors"
git push origin main
```

### 2. Deploy to Vercel
- Go to [vercel.com](https://vercel.com)
- Connect your GitHub repository
- Import the WHO-Sig-app project

### 3. Set Environment Variables in Vercel
Go to Project Settings > Environment Variables and add:

```bash
# Database
DATABASE_URL="postgresql://avnadmin:AVNS_r3_b6ksDYyWTw54wPGf@afro-server.postgres.database.azure.com:5432/defaultdb?sslmode=require"

# Data Source
NEXT_PUBLIC_WHO_DATA_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vS-8N_ALP4IX8k7sFPRzdeALWNNeYpOMmGpbVC3V-nfAyvHsa0ZB6I2YFgONi4McA/pub?output=xlsx"

# Azure OpenAI
AZURE_OPENAI_API_KEY="your-azure-openai-key"

# Mapbox (get from mapbox.com)
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"
MAPBOX_ACCESS_TOKEN="your-mapbox-token"
```

### 4. Deploy
- Click "Deploy" in Vercel
- Wait for deployment to complete
- Test the live application

## 🔍 Post-Deployment Testing
1. **Data Loading**: Check that WHO events load from the API
2. **Map Display**: Verify Mapbox maps show correctly
3. **AI Analysis**: Test outbreak analysis functions
4. **Alert System**: Verify AI alerts display properly
5. **Responsive Design**: Test on mobile and desktop

## 🐛 Troubleshooting
- **No Data**: Check DATABASE_URL and Google Sheets URL
- **Map Issues**: Verify Mapbox tokens are valid
- **AI Errors**: Check Azure OpenAI API key and deployment name
- **Build Failures**: Check Vercel deployment logs

## 📊 Expected Performance
- AI prompts now use ~5k tokens (well under 128k limit)
- Faster response times due to optimized prompts
- Stable runtime with proper error handling
- All components have safety checks for undefined data
