# WHO Signal Intelligence Dashboard - Streamlit

This folder contains the complete Streamlit application that you can run locally.

## Installation

1. Install required packages:
```bash
pip install streamlit pandas pydeck plotly
```

2. Get your Mapbox token (optional, for better maps):
   - Sign up at https://account.mapbox.com/
   - Create an access token
   - Add to environment: `export MAPBOX_TOKEN=your_token_here`

## Running the App

### Light Theme (Neumorphic Design)
```bash
streamlit run scripts/streamlit_app_light.py
```

### Dark Theme
```bash
streamlit run scripts/streamlit_app_dark.py
```

## Data Source

The app loads data from a Google Sheets CSV export. The expected columns are:
- `COUNTRY`: Country name
- `DISEASE`: Disease name  
- `GRADE`: Event grade (Grade 1, Grade 2, Grade 3, Ungraded)
- `EVENT_TYPE`: Type of event (Outbreak, Humanitarian Crisis, etc.)
- `STATUS`: Event status (New, Ongoing, Resolved)
- `DESCRIPTION`: Event description
- `LAT` / `LON`: Geographic coordinates
- `WEEKLINE`: Week identifier (e.g., "2025-W12")

## Customization

### Update Data Source
Edit the `load_data()` function in the app file:
```python
url = "YOUR_GOOGLE_SHEETS_CSV_URL"
```

### Modify Styling
All CSS is in the `st.markdown()` block at the top of each app file.

### Change Map Style
In the pydeck chart configuration:
```python
map_style='mapbox://styles/mapbox/light-v11'  # or 'dark-v11', 'streets-v11', etc.
```

## Features

- **Real-time Filtering**: Filter by grade, year, event type, country, and disease
- **Interactive Map**: Click markers to see event details
- **Grade Summary**: Visual breakdown of events by grade
- **Responsive Design**: Works on desktop and tablet screens
- **Auto-refresh**: Data caches for 1 hour and refreshes automatically

## Troubleshooting

**Map not loading?**
- Check your internet connection
- Verify the CSV URL is accessible
- Ensure LAT/LON columns have valid numeric data

**Styling looks off?**
- Clear browser cache
- Try a different browser
- Check that Inter font is loading from Google Fonts

**Data not updating?**
- Click the "Refresh Data" button
- Restart the Streamlit server
- Check the Google Sheets CSV export URL

## Support

For issues or questions:
- Streamlit docs: https://docs.streamlit.io/
- PyDeck docs: https://deckgl.readthedocs.io/
- Mapbox docs: https://docs.mapbox.com/
