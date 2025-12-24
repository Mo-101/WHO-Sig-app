# WHO Signal Intelligence Dashboard - Streamlit Version

Complete production-ready Streamlit application matching the React dashboard exactly.

## Features

### Visual Design
- **Dual Themes**: Light (neumorphic) and dark themes with toggle button
- **Custom Mapbox Styles**: 
  - Light: `mapbox://styles/akanimo1/cld9l944e002g01oefypmh70y`
  - Dark: `mapbox://styles/akanimo1/cmj2p5vsl006401s5d32ofmnf`
- **Neumorphic Design**: Soft shadows and depth in light theme
- **Live Ticker**: Animated scrolling banner with latest events
- **Responsive Layout**: Three-panel layout (left sidebar, center map, right sidebar)

### Functionality
- **Interactive Filters**: Grade, Country, Disease, Event Type
- **Grade Summary**: Color-coded cards with event counts
- **Metrics Dashboard**: Total events, new events, ongoing, outbreaks
- **Interactive Map**: Pydeck visualization with grade-colored markers
- **Recent Signals Feed**: Right sidebar showing latest 10 events
- **Tooltips**: Rich hover information on map markers

## Installation

1. **Install Dependencies**:
\`\`\`bash
pip install streamlit pandas pydeck plotly
\`\`\`

2. **Run the Application**:
\`\`\`bash
streamlit run scripts/who_dashboard_app.py
\`\`\`

## Data Structure

The application expects a DataFrame with the following columns:

\`\`\`python
{
    'country': str,          # Country name
    'disease': str,          # Disease/condition name
    'grade': str,            # 'Grade 1', 'Grade 2', or 'Grade 3'
    'status': str,           # 'New', 'Ongoing', etc.
    'event_type': str,       # 'Outbreak', 'Epidemic', etc.
    'lat': float,            # Latitude
    'lon': float,            # Longitude
    'event_count': int,      # Number of events/cases
    'location': str,         # City/location name
    'description': str,      # Event description
    'cases': int,            # Total cases
    'deaths': int,           # Total deaths
    'report_date': datetime  # Date of report
}
\`\`\`

## Customization

### Connect to Real Data Source

Replace the `load_data()` function with your actual data source:

\`\`\`python
@st.cache_data(ttl=1800)
def load_data():
    # Option 1: Load from CSV
    df = pd.read_csv('who_events.csv')
    
    # Option 2: Load from API
    response = requests.get('YOUR_API_ENDPOINT')
    df = pd.DataFrame(response.json())
    
    # Option 3: Load from Database
    df = pd.read_sql_query("SELECT * FROM who_events", connection)
    
    df['report_date'] = pd.to_datetime(df['report_date'])
    return df
\`\`\`

### Add Mapbox Token

If you need a custom Mapbox token, add it to `.streamlit/config.toml`:

\`\`\`toml
[mapbox]
token = "your_mapbox_token_here"
\`\`\`

### Adjust Refresh Rate

Change the cache TTL to adjust data refresh rate:

\`\`\`python
@st.cache_data(ttl=900)  # Refresh every 15 minutes
\`\`\`

## Theme System

The app uses session state to manage themes:

- **Light Theme**: Neumorphic design with soft shadows (#e8eef5 background)
- **Dark Theme**: Sleek dark design (#0f1419 background)
- **Toggle Button**: Click sun/moon icon to switch themes

## Deployment

### Streamlit Cloud

1. Push code to GitHub
2. Connect to Streamlit Cloud
3. Deploy from your repository

### Local Server

\`\`\`bash
streamlit run scripts/who_dashboard_app.py --server.port 8501 --server.address 0.0.0.0
\`\`\`

### Docker

\`\`\`dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY scripts/who_dashboard_app.py .
CMD ["streamlit", "run", "who_dashboard_app.py"]
\`\`\`

## Performance Tips

1. **Cache Data**: The `@st.cache_data` decorator caches data loading
2. **Optimize Filters**: Filters update only when changed
3. **Lazy Loading**: Map renders only when data is available
4. **CSS Optimization**: Styles are loaded once per theme

## Troubleshooting

### Map Not Displaying
- Verify latitude/longitude columns exist and have valid values
- Check Mapbox token if using custom styles
- Ensure pydeck is installed: `pip install pydeck`

### Theme Toggle Not Working
- Clear browser cache
- Check session state in Streamlit settings
- Restart the Streamlit server

### Styling Issues
- Ensure Inter font is loading from Google Fonts
- Check CSS specificity for custom styles
- Verify browser supports CSS animations

## Integration with React App

This Streamlit app mirrors the React dashboard features:

- ✅ Same visual design (neumorphic light, sleek dark)
- ✅ Same layout structure (three panels)
- ✅ Same custom Mapbox styles
- ✅ Same color schemes and typography
- ✅ Same metrics and visualizations
- ✅ Same filter functionality

## Support

For issues or questions:
- Check the main README.md in the project root
- Review Streamlit documentation: https://docs.streamlit.io
- Check Pydeck documentation: https://deckgl.readthedocs.io

## License

Same as the main project license.
\`\`\`

\`\`\`txt file="" isHidden
