# WHO Signal Intelligence Dashboard - Streamlit

Complete Streamlit application matching the Next.js React dashboard design exactly.

## Quick Start

\`\`\`bash
# Install dependencies
pip install -r requirements.txt

# Run the app
streamlit run app.py
\`\`\`

The dashboard opens at http://localhost:8501

## Features

### Visual Design
- **Dual Themes**: Toggle between light neumorphic and dark themes
- **Custom Mapbox Styles**: Different styles per theme
  - Light: `mapbox://styles/akanimo1/cld9l944e002g01oefypmh70y`
  - Dark: `mapbox://styles/akanimo1/cmj2p5vsl006401s5d32ofmnf`
- **Three-Panel Layout**: Left sidebar (filters), center (map), right sidebar (signals)
- **Live Ticker**: Animated scrolling banner with latest events
- **Interactive Map**: Grade-colored markers with rich tooltips

### Functionality
- Filter by Grade, Country, Disease, Event Type
- Grade Summary with color-coded counts
- Metrics: Total Events, New Events, Ongoing, Outbreaks
- Recent Signals feed with event details
- Theme persistence during session

## Data Structure

Expected DataFrame columns:

\`\`\`python
{
    'country': str,          # Country name
    'disease': str,          # Disease name
    'grade': str,            # 'Grade 1', 'Grade 2', 'Grade 3'
    'status': str,           # 'New', 'Ongoing'
    'event_type': str,       # 'Outbreak', etc.
    'lat': float,            # Latitude
    'lon': float,            # Longitude
    'event_count': int,      # Case count
    'location': str,         # City name
    'description': str,      # Event description
    'cases': int,            # Total cases
    'deaths': int,           # Total deaths
    'report_date': datetime  # Report date
}
\`\`\`

## Customization

### Connect Real Data

Replace `load_data()` in `app.py`:

\`\`\`python
@st.cache_data(ttl=1800)
def load_data():
    # From CSV
    df = pd.read_csv('your_data.csv')
    
    # From API
    response = requests.get('YOUR_API_URL')
    df = pd.DataFrame(response.json())
    
    # From Database
    df = pd.read_sql_query("SELECT * FROM events", conn)
    
    df['report_date'] = pd.to_datetime(df['report_date'])
    return df
\`\`\`

### Theme Colors

**Light Theme:**
- Background: #e8eef5
- Primary: #009edb (WHO blue)
- Text: #2c3e50

**Dark Theme:**
- Background: #0f1419
- Cards: #1a1f26
- Primary: #3b82f6
- Text: #e2e8f0

**Grade Colors:**
- Grade 3: #ff3355 (red)
- Grade 2: #ff9933 (orange)
- Grade 1: #ffcc00 (yellow)

## Deployment

### Streamlit Cloud
1. Push to GitHub
2. Connect to Streamlit Cloud
3. Deploy

### Local Server
\`\`\`bash
streamlit run app.py --server.port 8501
\`\`\`

### Docker
\`\`\`dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["streamlit", "run", "app.py"]
\`\`\`

## Comparison with React App

This Streamlit app has complete feature parity with the Next.js dashboard:
- ✅ Same visual design (neumorphic/dark themes)
- ✅ Same layout structure
- ✅ Same custom Mapbox styles
- ✅ Same color schemes
- ✅ Same filters and metrics
- ✅ Same live ticker animation

## Troubleshooting

**Map not displaying**: Verify lat/lon columns have valid values

**Theme toggle not working**: Clear browser cache and restart server

**Styling issues**: Ensure Inter font loads from Google Fonts

## License

Same as main project license.
