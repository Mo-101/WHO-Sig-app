// WHO and health emergency data sources for AI monitoring
export const WHO_DATA_SOURCES = [
  {
    id: "powerbi-dashboard",
    name: "WHO AFRO PowerBI Dashboard",
    url: "https://app.powerbi.com/view?r=eyJrIjoiMWFhMWZjMTYtMmY2My00NTgzLThkMzEtZWI5MjgyMzYwM2Y5IiwidCI6ImY2MTBjMGI3LWJkMjQtNGIzOS04MTBiLTNkYzI4MGFmYjU5MCIsImMiOjh9",
    type: "dashboard",
    priority: "high",
    description: "Real-time AFRO disease outbreak dashboard",
  },
  {
    id: "emergency-data",
    name: "WHO AFRO Emergency Data Portal",
    url: "https://emergencydata.afro.who.int/",
    type: "data-portal",
    priority: "critical",
    description: "Emergency health data and analytics",
  },
  {
    id: "geohemp",
    name: "Geographic Health Event Mapping Platform",
    url: "https://geohemp.afro.who.int/",
    type: "mapping",
    priority: "high",
    description: "Geographic mapping of health events",
  },
  {
    id: "eios",
    name: "WHO EIOS Monitoring Portal",
    url: "https://eios.who.int/portal/monitoring/",
    type: "monitoring",
    priority: "critical",
    description: "Epidemic intelligence from open sources",
  },
  {
    id: "disease-outbreaks",
    name: "WHO AFRO Disease Outbreaks",
    url: "https://www.afro.who.int/health-topics/disease-outbreaks",
    type: "news",
    priority: "high",
    description: "Official disease outbreak information",
  },
  {
    id: "sway-report",
    name: "WHO Sway Report",
    url: "https://sway.cloud.microsoft/Ku3GH7jhck5vr8Ds?ref=Link",
    type: "report",
    priority: "medium",
    description: "Interactive health reports and presentations",
  },
] as const

export type DataSource = (typeof WHO_DATA_SOURCES)[number]

// Additional updates can be added here if necessary
