# WHO Signal Intelligence Dashboard - Streamlit Application

This directory contains a complete Streamlit application that matches the Next.js dashboard design.

## Files

1. **app.py** - Main Streamlit application with neumorphic light theme
2. **requirements.txt** - Python dependencies

## Features

- **Left Sidebar**: Filter controls for Grade, Country, Disease, and Event Type with Grade Summary
- **Header Bar**: Title with live status indicator
- **Metrics Row**: Total Events, New Events, Ongoing, and Outbreaks counts
- **Interactive Map**: Geographic visualization using PyDeck and Mapbox
- **Right Sidebar**: Recent signals feed with detailed event information
- **Neumorphic Design**: Beautiful soft shadows and light color scheme (#e8eef5)

## Installation

1. Install required packages:
```bash
pip install -r requirements.txt
```

2. Set up Mapbox token (optional for better maps):
   - Create a `.streamlit/secrets.toml` file in your project root
   - Add your Mapbox token: `MAPBOX_TOKEN = "your_token_here"`
   - Get a free token at https://account.mapbox.com/access-tokens/

## Usage

Run the application:
```bash
streamlit run app.py
```

The dashboard will open in your browser at http://localhost:8501

## Customization

### Data Source
Replace the `load_data()` function in app.py with your actual data source:
```python
@st.cache_data(ttl=1800)
def load_data():
    # Replace this URL with your data source
    url = "your_google_sheets_csv_url_or_api_endpoint"
    df = pd.read_csv(url)
    return df
```

### Expected Data Structure
Your data should include these columns:
- `country` - Country name
- `disease` - Disease/event name
- `grade` - Grade 1, Grade 2, or Grade 3
- `status` - New, Ongoing, etc.
- `event_type` - Outbreak, etc.
- `lat` - Latitude coordinate
- `lon` - Longitude coordinate
- `event_count` - Number of cases
- `location` - Location name
- `description` - Event description
- `year` - Year of event
- `report_date` - Date reported

### Styling
All styling is contained in the CSS section of app.py. Key colors:
- Background: #e8eef5 (light blue-gray)
- Primary: #009edb (WHO blue)
- Secondary: #0056b3 (darker blue)
- Grade 3: #ff3355 (red)
- Grade 2: #ff9933 (orange)
- Grade 1: #ffcc00 (yellow)

## Layout

The application uses a three-column layout:
- **Left Sidebar** (280px): Filters and grade summary
- **Center Area**: Header, metrics, and map
- **Right Sidebar** (280px): Recent signals feed

## Notes

- The demo includes sample data for 8 African countries
- Map uses PyDeck with Mapbox styling
- All filters are functional and update the map and metrics in real-time
- The design matches the Next.js version exactly
