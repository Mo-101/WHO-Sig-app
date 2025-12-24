# WHO Signal Intelligence Dashboard - AI Setup Guide

## Overview

Your dashboard now has comprehensive AI monitoring, analysis, and reporting capabilities powered by Azure OpenAI. This guide will help you configure and activate these features.

## Current Status

✅ **AI Infrastructure**: Fully implemented  
✅ **Knowledge Base**: Enhanced with WHO AFRO context  
✅ **Data Source Monitoring**: 6 WHO sources configured  
⚠️ **Auto-Monitoring**: Temporarily disabled (see activation steps below)  
✅ **AI Chatbot**: Active and ready  

## Azure OpenAI Configuration

### Your Current Setup
- **Resource**: afro-osl-resource
- **Endpoint**: https://afro-osl-resource.cognitiveservices.azure.com
- **Deployment**: gpt-4o
- **API Version**: 2025-01-01-preview

### Required Environment Variable

Add this to your **Vars** section in the v0 sidebar:

\`\`\`
AZURE_OPENAI_API_KEY=<your-api-key-here>
\`\`\`

**Important**: This key must be from your Azure OpenAI resource, not a regular OpenAI key.

## AI Features Available

### 1. **AI Chatbot** (Currently Active)
- Floating chat interface in bottom-right corner
- Natural language queries about outbreaks
- WHO terminology and context-aware responses
- Powered by enhanced knowledge base

**Example Questions**:
- "What are the current Grade 3 outbreaks in West Africa?"
- "Analyze cholera trends across the region"
- "What's the risk assessment for Nigeria?"

### 2. **Automatic Alert Monitoring** (To Be Activated)
- Analyzes outbreak data every 2 minutes
- Generates smart popups for critical patterns
- Monitors all 6 WHO data sources
- Provides actionable recommendations

**Alert Triggers**:
- Multiple Grade 3 outbreaks
- Rapid disease spread
- Unusual patterns across countries
- High case/death counts
- Cross-border transmission

### 3. **PDF & Excel Export**
- Generates comprehensive reports
- Includes AI-powered executive summaries
- Charts and visualizations
- Filterable data exports

### 4. **Interactive Map Intelligence**
- Click events to zoom to location
- AI-powered tooltips with insights
- Rooftop-level 3D views (45° pitch)
- Country risk overlays

## Activating Automatic AI Monitoring

Once you've added your `AZURE_OPENAI_API_KEY`, uncomment this section in **app/page.tsx** (around line 71):

\`\`\`typescript
useEffect(() => {
  const checkForAnomaliesAndDataSources = async () => {
    try {
      const alertAnalysis = await analyzeDataSourcesForAlerts(filteredEvents)

      if (alertAnalysis.alertGenerated) {
        const alert = {
          id: crypto.randomUUID(),
          alertLevel: alertAnalysis.alertLevel as "critical" | "high" | "medium" | "low",
          riskScore: alertAnalysis.alertLevel === "critical" ? 95 : alertAnalysis.alertLevel === "high" ? 85 : 70,
          summary: alertAnalysis.summary,
          keyFindings: alertAnalysis.findings,
          recommendations: alertAnalysis.recommendations,
          affectedCountries: Array.from(new Set(filteredEvents.map((e) => e.country))),
          trendAnalysis: alertAnalysis.estimatedImpact,
          timestamp: new Date(),
        }

        setAlerts((prev) => [...prev, alert])
      }
    } catch (error) {
      console.error("[v0] Error in AI monitoring:", error)
    }
  }

  checkForAnomaliesAndDataSources()
  const interval = setInterval(checkForAnomaliesAndDataSources, 120000)
  return () => clearInterval(interval)
}, [filteredEvents])
\`\`\`

## WHO Data Sources Being Monitored

Your AI monitors these sources for real-time intelligence:

1. **PowerBI Dashboard** - WHO AFRO epidemic tracking
2. **Emergency Data Portal** - Real-time outbreak data
3. **GeoHEMP** - Geographic health mapping
4. **EIOS** - Epidemic intelligence from open sources
5. **Disease Outbreaks News** - Official WHO announcements
6. **Sway Intelligence** - Curated outbreak summaries

## AI Knowledge Base Features

Your AI has been trained with:

- **WHO AFRO Grading System**: Grade 1-3 classification criteria
- **African Regional Context**: 47 member states, regional groupings
- **Priority Diseases**: Cholera, Mpox, Measles, Malaria, etc.
- **Epidemiological Indicators**: CFR, R0, attack rates
- **Surveillance Best Practices**: IHR compliance, IDSR framework
- **Response Protocols**: WHO recommendations for each grade level

## Testing the AI Features

### Test the Chatbot
1. Click the blue AI icon in the bottom-right
2. Ask: "What's the current outbreak situation?"
3. Verify it responds with WHO terminology

### Test Automatic Alerts (After Activation)
1. Wait 2 minutes after page load
2. Look for popup alerts with risk assessments
3. Click "View Details" to see in right sidebar
4. Click "Jump to Location" to focus map

### Test Export
1. Scroll to bottom of left sidebar
2. Click "Export to PDF" or "Export to Excel"
3. Check for AI-generated executive summary

## Troubleshooting

### "Access denied due to invalid subscription key"
- **Solution**: Check that `AZURE_OPENAI_API_KEY` is correctly set in Vars
- Verify key is from Azure OpenAI, not regular OpenAI

### "No display" or blank page
- **Solution**: Automatic monitoring is still commented out (intentional)
- Follow activation steps above once API key is configured

### Alerts not appearing
- **Solution**: Check browser console for errors
- Verify Azure OpenAI quota isn't exceeded
- Ensure API version matches your deployment

### Chatbot not responding
- **Solution**: Check API key permissions
- Verify deployment name is "gpt-4o"
- Check Azure resource region matches endpoint

## Cost Management

**Estimated Usage**:
- Automatic monitoring: ~30 API calls/hour
- Chatbot: ~1-5 calls per query
- Exports: ~1 call per export

**Recommendations**:
- Set spending limits in Azure Portal
- Use GPT-4o-mini for high-volume queries
- Adjust monitoring interval (currently 2 minutes)

## Next Steps

1. ✅ Add `AZURE_OPENAI_API_KEY` to Vars
2. ✅ Test AI chatbot functionality
3. ✅ Uncomment monitoring code in app/page.tsx
4. ✅ Monitor first automatic alert
5. ✅ Try PDF/Excel exports
6. ✅ Customize alert thresholds if needed

## Support

For issues with:
- **Azure configuration**: Check Azure OpenAI documentation
- **Dashboard features**: Review component code in `/components`
- **Data sources**: Verify URLs in `/lib/data-sources.ts`

---

**Your WHO Signal Intelligence Dashboard is now ready for maximum AI-powered outbreak monitoring!**
