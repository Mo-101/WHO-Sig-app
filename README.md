# WHO Signal Intelligence Dashboard

*Real-time WHO AFRO outbreak monitoring and AI-powered signal detection*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mo-101s-projects/v0-streamlit-app-creation)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/egARTRPLgwc)

## Overview

A comprehensive dashboard for monitoring WHO African Region (AFRO) disease outbreak events with real-time data fetching, AI-powered analysis, interactive mapping, and intelligent alerting.

**Key Features:**
- 📊 Real-time outbreak data from WHO AFRO sources
- 🤖 AI-powered outbreak analysis using fine-tuned Azure OpenAI GPT-4o-mini
- 🗺️ Interactive Mapbox maps with outbreak event markers
- 🔔 Intelligent alert system with anomaly detection
- 📈 Advanced analytics and visualization
- 💾 PostgreSQL database caching for reliability
- 🔍 Advanced search and filtering
- 📤 Export capabilities (PDF, Excel, CSV)

## Quick Start

See **[QUICKSTART.md](./QUICKSTART.md)** for 5-minute setup guide.

## Deployment

Your project is live at:

**[https://vercel.com/mo-101s-projects/v0-streamlit-app-creation](https://vercel.com/mo-101s-projects/v0-streamlit-app-creation)**

## Environment Variables

This project requires the following environment variables:

### Required Variables

- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key for AFRO-AI deployment
- `NEXT_PUBLIC_WHO_DATA_URL` - Google Sheets URL with outbreak data
- `POSTGRES_HOST` - Azure PostgreSQL hostname (afro-server.postgres.database.azure.com)
- `POSTGRES_PORT` - PostgreSQL port (5432)
- `POSTGRES_DATABASE` - Database name (who_afro_db)
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password

### Where to Set Variables

**For v0/Vercel:**
- Add variables in the **Vars** section of the v0 in-chat sidebar
- Or in your Vercel project settings under Environment Variables

**For Local Development:**
- Copy `.env.local.example` to `.env.local`
- Add your actual values

See **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** for detailed configuration instructions.

## Architecture

### Data Flow
```
Google Sheets XLSX → API Route → PostgreSQL Cache → SWR Hook → UI Components
```

### AI Analysis
```
Outbreak Data → Azure OpenAI (AFRO-AI) → Risk Assessment → Alert Generation
```

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **AI**: Azure OpenAI (Fine-tuned GPT-4o-mini)
- **Database**: Azure PostgreSQL (Neon driver)
- **Maps**: Mapbox GL JS
- **UI**: Tailwind CSS v4, shadcn/ui, Neumorphic design
- **Data**: SWR for caching, XLSX for parsing

## Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Environment configuration
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions

## Azure Resources

### OpenAI Resource
- **Name**: afro-ai-resource
- **Deployment**: AFRO-AI
- **Model**: gpt-4o-mini-2024-07-18 (fine-tuned)
- **Rate Limits**: 500K tokens/min, 3K requests/min

### PostgreSQL Database
- **Server**: afro-server
- **Resource Group**: EPROSL-P-EUW-RG01
- **Region**: West Europe
- **Version**: PostgreSQL 14

### Container App
- **Name**: afro-container
- **Resource Group**: EPROSL-P-EUW-RG01

## Build and Deploy

Continue building your app on:

**[https://v0.app/chat/egARTRPLgwc](https://v0.app/chat/egARTRPLgwc)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Support

For additional help:
- Azure OpenAI: [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
- WHO Data: Contact WHO AFRO emergency data team
- Mapbox: [Mapbox Documentation](https://docs.mapbox.com/)

## License

Built for WHO AFRO emergency response and outbreak intelligence.
