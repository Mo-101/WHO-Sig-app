# WHO Dashboard AI Integration Guide

## Overview
This dashboard is configured to use your Azure OpenAI deployment for AI-powered disease surveillance monitoring, analysis, and reporting.

## Your Azure Configuration

### Deployment Details:
- **Resource**: afro-osl-resource
- **Endpoint**: https://afro-osl-resource.cognitiveservices.azure.com/
- **Deployment**: gpt-4o
- **API Version**: 2024-12-01-preview

## Model Selection for WHO Disease Surveillance

1. **GPT-4o** (Primary - Already Configured)
   - **Use for**: Complex outbreak analysis, multi-factor risk assessment, report generation
   - **Why**: Superior reasoning, handles nuanced medical contexts, multilingual support
   - **When to use**: Main analysis, weekly reports, complex queries

2. **GPT-4o-mini** (Secondary - Cost Effective)
   - **Use for**: Real-time anomaly detection, quick classifications, routine monitoring
   - **Why**: Fast, cost-effective, good for high-frequency tasks
   - **When to use**: Continuous monitoring, alert triggers, simple queries

## Setup Instructions

### 1. Add Azure API Key to Environment Variables

**Required Environment Variable:**
\`\`\`env
AZURE_OPENAI_API_KEY=your_api_key_here
\`\`\`

**How to add:**
1. Go to the **Vars** section in the left sidebar
2. Click "Add Variable"
3. Name: `AZURE_OPENAI_API_KEY`
4. Value: Your Azure OpenAI API key from the Azure portal
5. Save

**Where to find your API key:**
- Azure Portal → Your Resource (afro-osl-resource) → Keys and Endpoint → KEY 1 or KEY 2

### 2. Deploy gpt-4o-mini (Optional but Recommended)

For cost optimization, deploy gpt-4o-mini in your Azure resource:
1. Go to Azure AI Foundry
2. Navigate to your resource: afro-osl-resource
3. Deploy model: gpt-4o-mini
4. Use deployment name: gpt-4o-mini

This allows the system to use cheaper models for routine monitoring while reserving gpt-4o for complex analysis.

#### 1. Azure Configuration

\`\`\`env
# Add to your environment variables in Vercel
AZURE_OPENAI_API_KEY=your_azure_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
\`\`\`

#### 2. Update AI SDK Configuration

The AI SDK in this project defaults to using the Vercel AI Gateway. To use your Azure setup:

\`\`\`typescript
// lib/ai-analysis.ts
import { generateObject, generateText } from "ai"
import { azure } from "@ai-sdk/azure"

// Configure Azure provider
const azureProvider = azure({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  resourceName: 'your-resource-name',
})

// Use in your functions
const { object } = await generateObject({
  model: azureProvider('gpt-4o'), // Your Azure deployment
  schema: outbreakAnalysisSchema,
  prompt: '...',
})
\`\`\`

## AI Features in Your Dashboard

### 1. AI Monitoring Panel (Left Sidebar)
- **Analyze Data**: Click to run comprehensive outbreak analysis
- **Detect Anomalies**: Identifies unusual patterns in real-time
- **Ask Questions**: Natural language queries about your data

### 2. Automatic Alert Popups
- Triggered when AI detects critical anomalies
- Shows risk score, findings, and recommendations
- Grade-colored based on severity

### 3. Smart Insights
- Disease spread velocity tracking
- Geographic risk mapping
- Predictive trend analysis

## Training the AI for WHO Context

The AI is pre-configured with WHO-specific context including:
- Grade 1-3 classification system
- WHO response frameworks
- Disease-specific risk factors
- Regional health capacity considerations

### Customizing AI Behavior

Edit `lib/ai-analysis.ts` to adjust:
- Alert thresholds
- Risk scoring algorithms
- Analysis depth
- Report formats

## Cost Optimization

### Current Configuration:
1. **GPT-4o for analysis** (on-demand) - ~$0.02 per analysis
2. **GPT-4o-mini for monitoring** (recommended for continuous monitoring) - ~$0.002 per check
3. **Estimated cost**: $5-10/day for 50 analyses + hourly monitoring

### Reducing Costs:
- Enable result caching (10-minute TTL)
- Use gpt-4o-mini for non-critical analyses
- Batch similar queries together
- Set rate limits per user

## Testing Your Setup

### Quick Test:
1. Open your dashboard (light or dark theme)
2. Click "Analyze Data" in the AI Monitoring Panel
3. Wait 5-10 seconds for Azure to process
4. Review the AI-generated insights popup

### Expected Response Time:
- **Anomaly Detection**: 2-5 seconds
- **Full Analysis**: 5-10 seconds
- **Report Generation**: 10-15 seconds
- **Natural Language Query**: 3-7 seconds

### Troubleshooting:
- **Error: "Invalid API key"**: Check your AZURE_OPENAI_API_KEY in Vars section
- **Error: "Deployment not found"**: Verify gpt-4o is deployed in your Azure resource
- **Slow responses**: Check Azure region latency (try switching regions if persistent)

## Security Best Practices

1. **API Key Security**: Never commit AZURE_OPENAI_API_KEY to git
2. **Server-side only**: All AI calls use server actions (never client-side)
3. **Rate limiting**: Implemented to prevent abuse
4. **Input validation**: All user queries are sanitized
5. **Audit logging**: Track all AI interactions

## Deployment Checklist

- [x] Azure OpenAI SDK configured (@ai-sdk/azure)
- [x] AI analysis functions created (lib/ai-analysis.ts)
- [x] UI components ready (ai-monitoring-panel, ai-alert-popup)
- [ ] Add AZURE_OPENAI_API_KEY to Vercel environment variables
- [ ] Test AI analysis with sample data
- [ ] Optional: Deploy gpt-4o-mini for cost optimization
- [ ] Configure alert thresholds for your needs
- [ ] Set up monitoring dashboard in Azure portal

## Next Steps

1. **Add your API key** to the Vars section
2. **Test the AI features** in your dashboard
3. **Monitor usage** in Azure portal (Cost Management)
4. **Adjust prompts** in lib/ai-analysis.ts based on results
5. **Enable continuous monitoring** (optional cron job)

## Support Resources

- **Azure OpenAI Documentation**: https://learn.microsoft.com/azure/ai-services/openai/
- **AI SDK Documentation**: https://sdk.vercel.ai
- **Your Azure Portal**: https://portal.azure.com
- **Resource Direct Link**: https://portal.azure.com/#@/resource/subscriptions/YOUR_SUBSCRIPTION/resourceGroups/YOUR_RG/providers/Microsoft.CognitiveServices/accounts/afro-osl-resource
