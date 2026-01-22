# WHO-AFRO ALERT SIGNAL CODES (COMPLETE)

**Exact AFRO country codes (ISO3)**
**AFRO disease codes aligned to WHO usage**
**AFRO hazard taxonomy**
**AFRO-ready pull logic**
**Open source API data sources**

No placeholders, no abstractions. Engineer/data scientist ready.

---

# PART A --- WHO AFRO MASTER REFERENCE (LOCK THIS FIRST)

## A1. WHO AFRO Country List (ISO3 --- EXACT)

These are the **only countries your system must pull**.

```json
[
"AGO","BEN","BWA","BFA","BDI","CPV","CMR","CAF","TCD","COM",
"COG","CIV","COD","GNQ","ERI","ETH","GAB","GMB","GHA","GIN",
"GNB","KEN","LSO","LBR","MDG","MWI","MLI","MRT","MUS","MOZ",
"NAM","NER","NGA","RWA","STP","SEN","SYC","SLE","ZAF","SSD",
"TZA","TGO","UGA","ZMB","ZWE","DZA","TUN","LBY","MAR","SWZ"
]
```

**Rule**
- ❌ No non-AFRO spillover (e.g. ESP, PRT, FRA)
- ✅ North Africa INCLUDED (DZA, TUN, MAR, LBY)

This list becomes a **hard filter** at ingestion time.

## A2. AFRO Priority Disease & Syndrome Codes (WHO-aligned)

Use **ICD-10 + WHO event taxonomy**, simplified for alerting.

### A2.1 Core Epidemic Diseases (AFRO)

```json
[
{"code":"A00","name":"Cholera","syndrome":"AWD"},
{"code":"A01","name":"Typhoid fever","syndrome":"Febrile"},
{"code":"A20","name":"Plague","syndrome":"Febrile"},
{"code":"A80","name":"Polio","syndrome":"AFP"},
{"code":"A90","name":"Dengue","syndrome":"Febrile"},
{"code":"A92","name":"Yellow fever","syndrome":"Febrile"},
{"code":"A95","name":"Yellow fever","syndrome":"Febrile"},
{"code":"B50","name":"Malaria","syndrome":"Febrile"},
{"code":"B05","name":"Measles","syndrome":"Rash"},
{"code":"B20","name":"HIV","syndrome":"Chronic"},
{"code":"A16","name":"Tuberculosis","syndrome":"Respiratory"},
{"code":"A98","name":"Viral hemorrhagic fevers","syndrome":"Hemorrhagic"},
{"code":"A99","name":"Ebola/Marburg","syndrome":"Hemorrhagic"},
{"code":"U07","name":"COVID-19","syndrome":"Respiratory"},
{"code":"A82","name":"Rabies","syndrome":"Neurological"},
{"code":"A37","name":"Pertussis","syndrome":"Respiratory"},
{"code":"A33","name":"Neonatal tetanus","syndrome":"Neurological"},
{"code":"A39","name":"Meningococcal disease","syndrome":"Neurological"},
{"code":"B55","name":"Leishmaniasis","syndrome":"Febrile"},
{"code":"A27","name":"Leptospirosis","syndrome":"Febrile"},
{"code":"A96","name":"Lassa fever","syndrome":"Hemorrhagic"},
{"code":"A78","name":"Q fever","syndrome":"Febrile"},
{"code":"A75","name":"Typhus","syndrome":"Febrile"}
]
```

### A2.2 AFRO Syndromic Buckets (used for weak signals)

```json
[
"AWD",
"AFP",
"ILI",
"SARI",
"Febrile",
"Hemorrhagic",
"Rash",
"Neurological",
"Chronic",
"Respiratory"
]
```

---

# PART B --- OPEN SOURCE API DATA SOURCES (AFRO PULL)

## B1. DISEASE OUTBREAK ALERT APIs

### B1.1 ProMED-mail

```json
{
  "source_id": "PROMED",
  "source_name": "ProMED-mail",
  "source_type": "alert",
  "base_url": "https://www.promedmail.org/",
  "rss_feeds": [
    "https://www.promedmail.org/promed-rss-feed/",
    "https://www.promedmail.org/rss/eafr/"
  ],
  "afro_filter": "ProMED-EAFR",
  "languages": ["en","fr","pt","es"],
  "update_frequency": "realtime",
  "auth_required": false,
  "data_format": "RSS/XML",
  "coverage": "AFRO_ALL"
}
```

### B1.2 HealthMap

```json
{
  "source_id": "HEALTHMAP",
  "source_name": "HealthMap",
  "source_type": "alert",
  "base_url": "https://healthmap.org/",
  "api_endpoint": "https://healthmap.org/HMapi.php",
  "params": {
    "diseases": "all",
    "regions": "AFRO_ISO3_LIST"
  },
  "languages": ["en","fr","pt","ar","zh","ru","es"],
  "update_frequency": "15min",
  "auth_required": true,
  "data_format": "JSON",
  "coverage": "AFRO_ALL"
}
```

### B1.3 Africa CDC Digital Surveillance

```json
{
  "source_id": "AFRICACDC",
  "source_name": "Africa CDC Digital Disease Surveillance",
  "source_type": "alert",
  "base_url": "https://africacdc.org/",
  "dashboard_url": "https://africacdc.org/disease-surveillance/",
  "update_frequency": "daily",
  "auth_required": true,
  "data_format": "JSON/Dashboard",
  "coverage": "AFRO_AU_55"
}
```

## B2. OFFICIAL HEALTH DATA APIs

### B2.1 WHO GHO OData API

```json
{
  "source_id": "WHO_GHO",
  "source_name": "WHO Global Health Observatory",
  "source_type": "gov",
  "base_url": "https://ghoapi.azureedge.net/api/",
  "endpoints": {
    "indicators": "https://ghoapi.azureedge.net/api/Indicator",
    "countries": "https://ghoapi.azureedge.net/api/DIMENSION/COUNTRY/DimensionValues",
    "data": "https://ghoapi.azureedge.net/api/{INDICATOR_CODE}?$filter=SpatialDim eq '{ISO3}'"
  },
  "afro_filter_param": "SpatialDim",
  "auth_required": false,
  "data_format": "JSON/XML",
  "coverage": "AFRO_ALL"
}
```

### B2.2 DHIS2 Instances (Country-Specific)

```json
{
  "source_id": "DHIS2",
  "source_name": "DHIS2",
  "source_type": "gov",
  "api_spec": "https://docs.dhis2.org/en/develop/using-the-api/",
  "instances": [
    {"iso3":"KEN","url":"https://hiskenya.org/api/","auth":"oauth2"},
    {"iso3":"NGA","url":"https://dhis2.nigeria.gov.ng/api/","auth":"basic"},
    {"iso3":"GHA","url":"https://dhis2.moh.gov.gh/api/","auth":"basic"},
    {"iso3":"RWA","url":"https://hmis.moh.gov.rw/api/","auth":"basic"},
    {"iso3":"TZA","url":"https://dhis.moh.go.tz/api/","auth":"basic"},
    {"iso3":"UGA","url":"https://hmis.health.go.ug/api/","auth":"basic"},
    {"iso3":"ZMB","url":"https://hmis.dhis.co.zm/api/","auth":"basic"},
    {"iso3":"ETH","url":"https://dhis2.moh.gov.et/api/","auth":"basic"},
    {"iso3":"ZAF","url":"https://za.dhis2.org/api/","auth":"basic"},
    {"iso3":"MOZ","url":"https://sisma.misau.gov.mz/api/","auth":"basic"},
    {"iso3":"MWI","url":"https://dhis2.health.gov.mw/api/","auth":"basic"},
    {"iso3":"SEN","url":"https://dhis2.sante.gouv.sn/api/","auth":"basic"},
    {"iso3":"BFA","url":"https://dhis2.sante.gov.bf/api/","auth":"basic"},
    {"iso3":"MLI","url":"https://dhis2.sante.gov.ml/api/","auth":"basic"},
    {"iso3":"NER","url":"https://dhis2.sante.ne/api/","auth":"basic"}
  ],
  "auth_required": true,
  "data_format": "JSON",
  "rate_limit": "varies"
}
```

### B2.3 WAHO Regional DHIS2

```json
{
  "source_id": "WAHO",
  "source_name": "West African Health Organization DHIS2",
  "source_type": "gov",
  "base_url": "https://wahooas.org/dhis2/",
  "coverage_iso3": ["BEN","BFA","CPV","CIV","GMB","GHA","GIN","GNB","LBR","MLI","NER","NGA","SEN","SLE","TGO"],
  "auth_required": true,
  "data_format": "JSON",
  "contact": "info@wahooas.org"
}
```

### B2.4 OpenMRS REST API

```json
{
  "source_id": "OPENMRS",
  "source_name": "OpenMRS",
  "source_type": "ngo",
  "api_docs": "https://rest.openmrs.org/",
  "demo_url": "https://demo.openmrs.org/openmrs/ws/rest/v1/",
  "fhir_endpoint": "/ws/fhir2/R4/",
  "deployments": [
    {"iso3":"KEN","name":"KenyaEMR"},
    {"iso3":"UGA","name":"UgandaEMR"},
    {"iso3":"RWA","name":"Rwanda PIH"},
    {"iso3":"ETH","name":"ICAP Ethiopia"},
    {"iso3":"ZAF","name":"South Africa MRC"},
    {"iso3":"MWI","name":"Baobab Malawi"},
    {"iso3":"MOZ","name":"Mozambique"},
    {"iso3":"NGA","name":"IHV Nigeria"},
    {"iso3":"ZWE","name":"Zimbabwe"},
    {"iso3":"LSO","name":"Lesotho"}
  ],
  "auth_required": true,
  "data_format": "JSON/FHIR"
}
```

## B3. NEWS & MEDIA MONITORING APIs

### B3.1 GDELT

```json
{
  "source_id": "GDELT",
  "source_name": "GDELT Project",
  "source_type": "news",
  "base_url": "https://api.gdeltproject.org/api/v2/",
  "endpoints": {
    "doc": "https://api.gdeltproject.org/api/v2/doc/doc",
    "geo": "https://api.gdeltproject.org/api/v2/geo/geo",
    "tv": "https://api.gdeltproject.org/api/v2/tv/tv"
  },
  "query_template": {
    "mode": "artlist",
    "format": "json",
    "query": "{DISEASE_KEYWORD} sourcecountry:{ISO3}"
  },
  "languages": "100+",
  "update_frequency": "15min",
  "auth_required": false,
  "data_format": "JSON",
  "coverage": "AFRO_ALL",
  "python_package": "gdelt"
}
```

### B3.2 NewsAPI.org

```json
{
  "source_id": "NEWSAPI_ORG",
  "source_name": "NewsAPI.org",
  "source_type": "news",
  "base_url": "https://newsapi.org/v2/",
  "endpoints": {
    "everything": "https://newsapi.org/v2/everything",
    "top_headlines": "https://newsapi.org/v2/top-headlines"
  },
  "query_template": {
    "q": "{DISEASE_KEYWORD}",
    "language": "en|fr|ar|pt",
    "country": "{ISO2}"
  },
  "afro_sources": [
    {"iso3":"NGA","sources":["allafrica","punchng","vanguardngr"]},
    {"iso3":"ZAF","sources":["news24","timeslive","iol"]},
    {"iso3":"KEN","sources":["nation.co.ke","standardmedia.co.ke"]},
    {"iso3":"EGY","sources":["egypttoday","ahram.org.eg"]}
  ],
  "auth_required": true,
  "rate_limit": "100/day_free",
  "data_format": "JSON"
}
```

### B3.3 GNews API

```json
{
  "source_id": "GNEWS",
  "source_name": "GNews",
  "source_type": "news",
  "base_url": "https://gnews.io/api/v4/",
  "endpoints": {
    "search": "https://gnews.io/api/v4/search",
    "top_headlines": "https://gnews.io/api/v4/top-headlines"
  },
  "query_template": {
    "q": "{DISEASE_KEYWORD}",
    "country": "{ISO2}",
    "lang": "en|fr|ar"
  },
  "sources": "80000+",
  "auth_required": true,
  "rate_limit": "100/day_free",
  "data_format": "JSON"
}
```

### B3.4 NewsAPI.ai (Event Registry)

```json
{
  "source_id": "NEWSAPI_AI",
  "source_name": "NewsAPI.ai",
  "source_type": "news",
  "base_url": "https://newsapi.ai/api/v1/",
  "features": ["entity_extraction","sentiment","event_clustering","NLP"],
  "languages": "60+",
  "sources": "150000+",
  "auth_required": true,
  "data_format": "JSON"
}
```

### B3.5 NewsData.io

```json
{
  "source_id": "NEWSDATA",
  "source_name": "NewsData.io",
  "source_type": "news",
  "base_url": "https://newsdata.io/api/1/news",
  "query_template": {
    "q": "{DISEASE_KEYWORD}",
    "country": "{ISO2}",
    "language": "en,fr,ar,pt"
  },
  "languages": "86",
  "countries": "210",
  "auth_required": true,
  "rate_limit": "200/day_free",
  "data_format": "JSON"
}
```

### B3.6 World News API

```json
{
  "source_id": "WORLDNEWS",
  "source_name": "World News API",
  "source_type": "news",
  "base_url": "https://api.worldnewsapi.com/",
  "endpoints": {
    "search": "https://api.worldnewsapi.com/search-news"
  },
  "query_template": {
    "text": "{DISEASE_KEYWORD}",
    "source-countries": "{ISO2}"
  },
  "languages": "86",
  "countries": "210",
  "features": ["semantic_tagging","sentiment"],
  "auth_required": true,
  "data_format": "JSON"
}
```

## B4. SOCIAL MEDIA APIs

### B4.1 X (Twitter) API

```json
{
  "source_id": "TWITTER",
  "source_name": "X (Twitter) API",
  "source_type": "social",
  "base_url": "https://api.twitter.com/2/",
  "endpoints": {
    "search": "https://api.twitter.com/2/tweets/search/recent",
    "filtered_stream": "https://api.twitter.com/2/tweets/search/stream"
  },
  "query_template": {
    "query": "{DISEASE_KEYWORD} place_country:{ISO2}",
    "tweet.fields": "created_at,geo,lang,public_metrics"
  },
  "auth_required": true,
  "pricing": {
    "free": "1500_tweets/month",
    "basic": "$100/month_10k_tweets"
  },
  "python_package": "tweepy",
  "r_package": "rtweet"
}
```

### B4.2 Reddit API

```json
{
  "source_id": "REDDIT",
  "source_name": "Reddit API",
  "source_type": "social",
  "base_url": "https://oauth.reddit.com/",
  "afro_subreddits": [
    "r/africa","r/Nigeria","r/Kenya","r/southafrica","r/Ethiopia",
    "r/ghana","r/tanzania","r/uganda","r/zimbabwe","r/angola"
  ],
  "auth_required": true,
  "data_format": "JSON"
}
```

## B5. FACILITY & INFRASTRUCTURE APIs

### B5.1 Healthsites.io

```json
{
  "source_id": "HEALTHSITES",
  "source_name": "Healthsites.io",
  "source_type": "ngo",
  "base_url": "https://healthsites.io/api/v2/",
  "endpoints": {
    "facilities": "https://healthsites.io/api/v2/facilities/",
    "by_country": "https://healthsites.io/api/v2/facilities/?country={COUNTRY_NAME}"
  },
  "data_fields": ["name","lat","lon","amenity","healthcare","operator"],
  "auth_required": false,
  "data_format": "JSON/GeoJSON",
  "coverage": "AFRO_ALL"
}
```

### B5.2 HDX (Humanitarian Data Exchange)

```json
{
  "source_id": "HDX",
  "source_name": "Humanitarian Data Exchange",
  "source_type": "ngo",
  "base_url": "https://data.humdata.org/api/3/",
  "endpoints": {
    "package_search": "https://data.humdata.org/api/3/action/package_search",
    "package_show": "https://data.humdata.org/api/3/action/package_show"
  },
  "query_template": {
    "q": "health facilities {COUNTRY_NAME}",
    "fq": "groups:{ISO3_LOWER}"
  },
  "auth_required": false,
  "data_format": "JSON/CSV",
  "python_package": "hdx-python-api",
  "coverage": "AFRO_ALL"
}
```

## B6. SEARCH SIGNAL APIs

### B6.1 Google Trends

```json
{
  "source_id": "GTRENDS",
  "source_name": "Google Trends",
  "source_type": "search",
  "base_url": "https://trends.google.com/trends/",
  "python_package": "pytrends",
  "query_template": {
    "kw_list": ["{DISEASE_KEYWORD}"],
    "geo": "{ISO2}",
    "timeframe": "now 7-d"
  },
  "afro_geo_codes": {
    "NGA":"NG","KEN":"KE","ZAF":"ZA","ETH":"ET","GHA":"GH",
    "TZA":"TZ","UGA":"UG","DZA":"DZ","MAR":"MA","EGY":"EG"
  },
  "auth_required": false,
  "rate_limit": "unofficial",
  "use_case": "anomaly_detection"
}
```

---

# PART C --- AFRO MEDIA DISEASE ALERT SCHEMA (FINAL)

## C1. AFRO Media Signal (RAW)

### afro_media_signal

```json
{
  "signal_id": "uuid",
  "afro_region": "AFRO",
  "country_iso3": "NGA",
  "source_id": "GDELT|NEWSAPI_ORG|TWITTER|PROMED",
  "source_language": "en|fr|pt|ar|local",
  "source_name": "AllAfrica | Ministry of Health | Radio Okapi",
  "source_url": "https://...",
  "source_type": "news|gov|ngo|radio|social",
  "published_at": "2026-01-20T08:15:00Z",
  "fetched_at": "2026-01-20T08:30:00Z",
  "headline": "string",
  "full_text": "string",
  "matched_keywords": ["cholera","diarrhea","death"],
  "matched_icd10": ["A00"],
  "matched_syndrome": ["AWD"],
  "duplicate_hash": "sha256",
  "processing_status": "raw"
}
```

**Hard validation**
- country_iso3 MUST be in AFRO list
- Else → DROP

## C2. AFRO Extracted Event (Structured)

### afro_extracted_event

```json
{
  "event_id": "uuid",
  "signal_id": "uuid",
  "country_iso3": "NGA",
  "admin1": "Lagos",
  "admin2": null,
  "lat": 6.5244,
  "lon": 3.3792,
  "disease": {
    "icd10": "A00",
    "name": "Cholera",
    "syndrome": "AWD"
  },
  "temporal": {
    "event_start": "2026-01-15",
    "reported_on": "2026-01-20"
  },
  "cases": {
    "suspected": 120,
    "confirmed": null,
    "deaths": 8
  },
  "extraction_confidence": 0.81,
  "nlp_spans": {}
}
```

**Promotion rule**
- Disease OR syndrome must be mapped
- Location must be ≥ admin1

## C3. AFRO Incident Cluster (DEDUP)

### afro_incident_cluster

```json
{
  "incident_id": "uuid",
  "cluster_key": "NGA|A00|Lagos|2026W03",
  "country_iso3": "NGA",
  "admin1": "Lagos",
  "icd10": "A00",
  "syndrome": "AWD",
  "time_window": {
    "start": "2026-01-15",
    "end": "2026-01-21"
  },
  "signal_count": 4,
  "unique_sources": 3,
  "source_ids": ["GDELT","NEWSAPI_ORG","TWITTER"],
  "status": "emerging|ongoing|declining"
}
```

## C4. AFRO Media Alert (PDX-VISIBLE)

### pdx_afro_media_alert

```json
{
  "alert_id": "uuid",
  "alert_type": "AFRO_MEDIA_DISEASE",
  "country_iso3": "NGA",
  "admin1": "Lagos",
  "disease": {
    "icd10": "A00",
    "name": "Cholera",
    "syndrome": "AWD"
  },
  "alert_level": "WATCH|WARNING|HIGH",
  "confidence": 0.76,
  "severity": "MODERATE|HIGH|CRITICAL",
  "priority": 2,
  "status": "ACTIVE",
  "incident_id": "uuid",
  "evidence": {
    "signal_count": 7,
    "unique_sources": 4,
    "source_ids": ["GDELT","NEWSAPI_ORG","TWITTER","PROMED"],
    "top_urls": []
  },
  "recommended_afro_actions": [
    "Notify WCO Nigeria",
    "Cross-check EWARS",
    "Review STAR WASH risk"
  ],
  "visibility": {
    "PDX": true,
    "AskWHO": true,
    "Email": false
  }
}
```

---

# PART D --- AFRO NASA HAZARD ALERT (FINAL)

## D1. AFRO-Scoped NASA Observation

### afro_nasa_observation

```json
{
  "observation_id": "uuid",
  "source": "NASA",
  "dataset": "GPM_IMERG|SMAP|MODIS|VIIRS|FIRMS",
  "variable": "precipitation|soil_moisture|flood_extent|fire_points",
  "country_iso3": "MOZ",
  "admin1": "Sofala",
  "date": "2026-01-20",
  "value_num": 98.2,
  "value_units": "mm",
  "baseline_num": 31.4,
  "z_score": 3.1,
  "percentile": 98,
  "is_anomalous": true
}
```

**Pull logic**
- GPM / SMAP / MODIS clipped to AFRO polygons ONLY

## D2. AFRO Hazard Event

### afro_hazard_event

```json
{
  "hazard_event_id": "uuid",
  "hazard_type": "FLOOD|HEAVY_RAIN|DROUGHT|HEATWAVE|FIRE",
  "country_iso3": "MOZ",
  "admin1": "Sofala",
  "start_date": "2026-01-18",
  "end_date": null,
  "confidence": 0.89,
  "severity": "HIGH"
}
```

## D3. AFRO Health Risk Translation (MANDATORY)

### afro_hazard_health_link

```json
{
  "hazard_event_id": "uuid",
  "mapped_health_risks": [
    {"icd10":"A00","name":"Cholera","risk":"HIGH"},
    {"icd10":"B50","name":"Malaria","risk":"MEDIUM"},
    {"icd10":"A27","name":"Leptospirosis","risk":"MEDIUM"}
  ],
  "justification": "Flood + AWD history + population density",
  "forecast_days": 14
}
```

## D4. AFRO NASA Alert (PDX)

### pdx_afro_nasa_alert

```json
{
  "alert_id": "uuid",
  "alert_type": "AFRO_NASA_HAZARD",
  "country_iso3": "MOZ",
  "admin1": "Sofala",
  "hazard": "FLOOD",
  "confidence": 0.89,
  "severity": "HIGH",
  "linked_disease_risk": ["A00","B50","A27"],
  "status": "ACTIVE",
  "recommended_afro_actions": [
    "Pre-position WASH kits",
    "Enhance AWD surveillance",
    "Monitor STAR vulnerability"
  ]
}
```

---

# PART E --- AFRO FUSION RULE (PDX INTELLIGENCE)

### afro_fusion_alert

```json
{
  "fusion_id": "uuid",
  "country_iso3": "MOZ",
  "admin1": "Sofala",
  "components": {
    "nasa_alert_id": "uuid",
    "media_alert_id": "uuid"
  },
  "combined_risk": "VERY_HIGH",
  "confidence_boost": 0.18,
  "escalation_reason": "Flood precursor + AWD media signal"
}
```

---

# PART F --- API SOURCE REGISTRY (MASTER)

## F1. Source Registry Table

```json
[
  {"source_id":"PROMED","type":"alert","priority":1,"auth":"none","rate_limit":"none"},
  {"source_id":"HEALTHMAP","type":"alert","priority":1,"auth":"api_key","rate_limit":"1000/day"},
  {"source_id":"AFRICACDC","type":"alert","priority":1,"auth":"partnership","rate_limit":"varies"},
  {"source_id":"WHO_GHO","type":"gov","priority":2,"auth":"none","rate_limit":"none"},
  {"source_id":"DHIS2","type":"gov","priority":2,"auth":"oauth2/basic","rate_limit":"varies"},
  {"source_id":"WAHO","type":"gov","priority":2,"auth":"partnership","rate_limit":"varies"},
  {"source_id":"OPENMRS","type":"ngo","priority":3,"auth":"basic","rate_limit":"varies"},
  {"source_id":"GDELT","type":"news","priority":1,"auth":"none","rate_limit":"none"},
  {"source_id":"NEWSAPI_ORG","type":"news","priority":2,"auth":"api_key","rate_limit":"100/day_free"},
  {"source_id":"GNEWS","type":"news","priority":2,"auth":"api_key","rate_limit":"100/day_free"},
  {"source_id":"NEWSAPI_AI","type":"news","priority":2,"auth":"api_key","rate_limit":"paid"},
  {"source_id":"NEWSDATA","type":"news","priority":2,"auth":"api_key","rate_limit":"200/day_free"},
  {"source_id":"WORLDNEWS","type":"news","priority":2,"auth":"api_key","rate_limit":"paid"},
  {"source_id":"TWITTER","type":"social","priority":2,"auth":"oauth2","rate_limit":"1500/month_free"},
  {"source_id":"REDDIT","type":"social","priority":3,"auth":"oauth2","rate_limit":"60/min"},
  {"source_id":"HEALTHSITES","type":"ngo","priority":2,"auth":"none","rate_limit":"none"},
  {"source_id":"HDX","type":"ngo","priority":2,"auth":"none","rate_limit":"none"},
  {"source_id":"GTRENDS","type":"search","priority":3,"auth":"none","rate_limit":"unofficial"}
]
```

## F2. Disease Keyword Mapping (for API queries)

```json
{
  "A00": ["cholera","diarrhea","watery stool","AWD","acute watery"],
  "A01": ["typhoid","enteric fever"],
  "A20": ["plague","bubonic","pneumonic plague"],
  "A80": ["polio","paralysis","AFP","acute flaccid"],
  "A90": ["dengue","dengue fever","breakbone"],
  "A92": ["yellow fever","jaundice fever"],
  "A95": ["yellow fever"],
  "B50": ["malaria","plasmodium","febrile illness"],
  "B05": ["measles","rubeola","rash fever"],
  "A16": ["tuberculosis","TB","pulmonary TB"],
  "A98": ["hemorrhagic fever","VHF","bleeding"],
  "A99": ["ebola","marburg","EVD","filovirus"],
  "U07": ["covid","coronavirus","SARS-CoV-2"],
  "A96": ["lassa","lassa fever","hemorrhagic"],
  "A39": ["meningitis","meningococcal","CSM"],
  "A82": ["rabies","hydrophobia","dog bite"]
}
```

---

# PART G --- POSTGRES SQL SCHEMA

```sql
-- =========================================
-- PDX AFRO ALERT TRACKER (PostgreSQL 14+)
-- =========================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reference tables
CREATE TABLE IF NOT EXISTS ref_afro_countries (
  iso3 CHAR(3) PRIMARY KEY,
  name TEXT NOT NULL,
  is_afro BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO ref_afro_countries (iso3, name, is_afro) VALUES
('AGO','Angola',TRUE),('BEN','Benin',TRUE),('BWA','Botswana',TRUE),('BFA','Burkina Faso',TRUE),
('BDI','Burundi',TRUE),('CPV','Cabo Verde',TRUE),('CMR','Cameroon',TRUE),('CAF','Central African Republic',TRUE),
('TCD','Chad',TRUE),('COM','Comoros',TRUE),('COG','Congo',TRUE),('CIV','Côte d''Ivoire',TRUE),
('COD','Democratic Republic of the Congo',TRUE),('GNQ','Equatorial Guinea',TRUE),('ERI','Eritrea',TRUE),
('ETH','Ethiopia',TRUE),('GAB','Gabon',TRUE),('GMB','Gambia',TRUE),('GHA','Ghana',TRUE),
('GIN','Guinea',TRUE),('GNB','Guinea-Bissau',TRUE),('KEN','Kenya',TRUE),('LSO','Lesotho',TRUE),
('LBR','Liberia',TRUE),('MDG','Madagascar',TRUE),('MWI','Malawi',TRUE),('MLI','Mali',TRUE),
('MRT','Mauritania',TRUE),('MUS','Mauritius',TRUE),('MOZ','Mozambique',TRUE),('NAM','Namibia',TRUE),
('NER','Niger',TRUE),('NGA','Nigeria',TRUE),('RWA','Rwanda',TRUE),('STP','Sao Tome and Principe',TRUE),
('SEN','Senegal',TRUE),('SYC','Seychelles',TRUE),('SLE','Sierra Leone',TRUE),('ZAF','South Africa',TRUE),
('SSD','South Sudan',TRUE),('TZA','Tanzania',TRUE),('TGO','Togo',TRUE),('UGA','Uganda',TRUE),
('ZMB','Zambia',TRUE),('ZWE','Zimbabwe',TRUE),('DZA','Algeria',TRUE),('TUN','Tunisia',TRUE),
('LBY','Libya',TRUE),('MAR','Morocco',TRUE),('SWZ','Eswatini',TRUE)
ON CONFLICT (iso3) DO NOTHING;

CREATE TABLE IF NOT EXISTS ref_diseases (
  icd10 TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  syndrome TEXT NOT NULL
);

INSERT INTO ref_diseases (icd10, name, syndrome) VALUES
('A00','Cholera','AWD'),
('A01','Typhoid fever','Febrile'),
('A20','Plague','Febrile'),
('A80','Polio','AFP'),
('A90','Dengue','Febrile'),
('A92','Yellow fever','Febrile'),
('A95','Yellow fever','Febrile'),
('B50','Malaria','Febrile'),
('B05','Measles','Rash'),
('B20','HIV','Chronic'),
('A16','Tuberculosis','Respiratory'),
('A98','Viral hemorrhagic fevers','Hemorrhagic'),
('A99','Ebola/Marburg','Hemorrhagic'),
('U07','COVID-19','Respiratory'),
('A96','Lassa fever','Hemorrhagic'),
('A39','Meningococcal disease','Neurological'),
('A82','Rabies','Neurological'),
('A27','Leptospirosis','Febrile')
ON CONFLICT (icd10) DO NOTHING;

-- API Source Registry
CREATE TABLE IF NOT EXISTS ref_api_sources (
  source_id TEXT PRIMARY KEY,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  base_url TEXT NOT NULL,
  auth_type TEXT NOT NULL DEFAULT 'none',
  rate_limit TEXT,
  priority SMALLINT NOT NULL DEFAULT 2,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO ref_api_sources (source_id, source_name, source_type, base_url, auth_type, rate_limit, priority) VALUES
('PROMED','ProMED-mail','alert','https://www.promedmail.org/','none',NULL,1),
('HEALTHMAP','HealthMap','alert','https://healthmap.org/','api_key','1000/day',1),
('AFRICACDC','Africa CDC','alert','https://africacdc.org/','partnership',NULL,1),
('WHO_GHO','WHO GHO','gov','https://ghoapi.azureedge.net/api/','none',NULL,2),
('GDELT','GDELT','news','https://api.gdeltproject.org/api/v2/','none',NULL,1),
('NEWSAPI_ORG','NewsAPI.org','news','https://newsapi.org/v2/','api_key','100/day',2),
('GNEWS','GNews','news','https://gnews.io/api/v4/','api_key','100/day',2),
('TWITTER','X/Twitter','social','https://api.twitter.com/2/','oauth2','1500/month',2),
('HEALTHSITES','Healthsites.io','ngo','https://healthsites.io/api/v2/','none',NULL,2),
('HDX','HDX','ngo','https://data.humdata.org/api/3/','none',NULL,2),
('GTRENDS','Google Trends','search','https://trends.google.com/','none','unofficial',3)
ON CONFLICT (source_id) DO NOTHING;

-- Enums
DO $$ BEGIN
CREATE TYPE source_type AS ENUM ('news','gov','ngo','radio','social','alert','search');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE alert_type AS ENUM ('AFRO_MEDIA_DISEASE','AFRO_NASA_HAZARD','AFRO_FUSION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE workflow_status AS ENUM ('new','triage','under_verification','validated','published','suppressed','closed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE hazard_type AS ENUM ('FLOOD','HEAVY_RAIN','DROUGHT','HEATWAVE','FIRE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE alert_level AS ENUM ('WATCH','WARNING','HIGH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
CREATE TYPE severity_level AS ENUM ('LOW','MODERATE','HIGH','CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Media Signal Table
CREATE TABLE IF NOT EXISTS media_signal (
  signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  afro_region TEXT NOT NULL DEFAULT 'AFRO',
  country_iso3 CHAR(3) NOT NULL REFERENCES ref_afro_countries(iso3),
  source_id TEXT NOT NULL REFERENCES ref_api_sources(source_id),
  source_language TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  headline TEXT NOT NULL,
  full_text TEXT,
  matched_keywords TEXT[] NOT NULL DEFAULT '{}',
  matched_icd10 TEXT[],
  matched_syndrome TEXT[],
  duplicate_hash TEXT,
  raw_payload JSONB,
  processing_status TEXT NOT NULL DEFAULT 'raw'
);

CREATE INDEX IF NOT EXISTS idx_media_signal_country_time ON media_signal (country_iso3, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_signal_source ON media_signal (source_id);
CREATE INDEX IF NOT EXISTS idx_media_signal_duplicate_hash ON media_signal (duplicate_hash);

-- Extracted Event Table
CREATE TABLE IF NOT EXISTS extracted_event (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id UUID NOT NULL REFERENCES media_signal(signal_id) ON DELETE CASCADE,
  country_iso3 CHAR(3) NOT NULL REFERENCES ref_afro_countries(iso3),
  admin1 TEXT NOT NULL,
  admin2 TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  icd10 TEXT REFERENCES ref_diseases(icd10),
  disease_name TEXT,
  syndrome TEXT,
  event_start DATE,
  reported_on DATE NOT NULL,
  suspected_cases INTEGER,
  confirmed_cases INTEGER,
  deaths INTEGER,
  extraction_confidence NUMERIC(4,3) NOT NULL CHECK (extraction_confidence >= 0 AND extraction_confidence <= 1),
  nlp JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_extracted_event_country_disease_time ON extracted_event (country_iso3, icd10, reported_on DESC);

-- Incident Cluster Table
CREATE TABLE IF NOT EXISTS incident_cluster (
  incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_key TEXT NOT NULL UNIQUE,
  country_iso3 CHAR(3) NOT NULL REFERENCES ref_afro_countries(iso3),
  admin1 TEXT NOT NULL,
  icd10 TEXT REFERENCES ref_diseases(icd10),
  syndrome TEXT,
  window_start DATE NOT NULL,
  window_end DATE NOT NULL,
  signal_count INTEGER NOT NULL DEFAULT 0,
  unique_sources INTEGER NOT NULL DEFAULT 0,
  source_ids TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'emerging',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PDX Alert Table
CREATE TABLE IF NOT EXISTS pdx_alert (
  alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type alert_type NOT NULL,
  country_iso3 CHAR(3) NOT NULL REFERENCES ref_afro_countries(iso3),
  admin1 TEXT,
  icd10 TEXT REFERENCES ref_diseases(icd10),
  hazard hazard_type,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  alert_level alert_level NOT NULL,
  confidence NUMERIC(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  severity severity_level NOT NULL,
  priority SMALLINT NOT NULL CHECK (priority BETWEEN 1 AND 4),
  status workflow_status NOT NULL DEFAULT 'new',
  incident_id UUID REFERENCES incident_cluster(incident_id),
  hazard_event_id UUID,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility JSONB NOT NULL DEFAULT '{"PDX":true,"AskWHO":true,"Email":false}'::jsonb,
  governance JSONB NOT NULL DEFAULT '{"visibility":"internal","disclaimer":"unverified_signal"}'::jsonb,
  assigned_team TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pdx_alert_country_status_time ON pdx_alert (country_iso3, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_pdx_alert_type_time ON pdx_alert (alert_type, updated_at DESC);
```

---

# PART H --- API ENDPOINTS

**Base path:** `/api/v1/pdx/afro`

## H1. Reference

```
GET /ref/countries          → AFRO ISO3 list
GET /ref/diseases           → ICD10 + syndrome list
GET /ref/sources            → API source registry
```

## H2. Media Pipeline

```
POST /media/signals:ingest      → Ingest raw signals
POST /media/signals:extract     → Run NLP extraction
POST /media/incidents:cluster   → Group into incidents
POST /alerts:promote-media      → Promote to PDX alert
```

## H3. NASA Pipeline

```
POST /nasa/observations:ingest  → Ingest NASA observations
POST /nasa/hazards:detect       → Detect hazard events
POST /alerts:promote-nasa       → Promote to PDX alert
```

## H4. Alert Operations

```
GET    /alerts                  → List alerts (filter: country, status, type)
GET    /alerts/{alert_id}       → Get alert details
PATCH  /alerts/{alert_id}       → Update alert status/assignment
POST   /alerts/{alert_id}/actions → Add action/comment
```

## H5. Fusion

```
POST /fusion:compute            → Compute fusion alerts
GET  /fusion                    → List fusion links
```

---

# PART I --- VALIDATION RULES

## I1. Hard Filters (DROP if fail)

```
1. country_iso3 NOT IN ref_afro_countries → DROP
2. source_id NOT IN ref_api_sources → DROP
3. duplicate_hash EXISTS → DROP
4. published_at > now() + 1hr → DROP (future date)
```

## I2. Soft Filters (FLAG if fail)

```
1. extraction_confidence < 0.5 → FLAG for manual review
2. admin1 = NULL → FLAG incomplete location
3. icd10 = NULL AND syndrome = NULL → FLAG unmapped disease
```

---

**Final hard truth**

If PDX:
- ❌ doesn't restrict to AFRO ISO3s
- ❌ doesn't use WHO disease codes
- ❌ doesn't explicitly map hazards → diseases
- ❌ doesn't track source_id for each signal

then it is **not** an AFRO preparedness system — it's a generic dashboard.

What you now have is **AFRO-grade, defensible, auditable intelligence architecture** with integrated open source API data feeds.
