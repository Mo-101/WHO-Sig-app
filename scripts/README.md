# WHO Signal Intelligence Dashboard - Streamlit Application

This directory contains a complete Streamlit application that matches the Next.js dashboard design with full feature parity.

## Files

1. **app.py** - Main Streamlit application with light/dark theme support
2. **requirements.txt** - Python dependencies

## Features

- **Dual Themes**: Toggle between light neumorphic theme and dark theme with theme switcher button
- **Left Sidebar**: Filter controls for Grade, Country, Disease, and Event Type with Grade Summary
- **Header Bar**: Title with live status indicator and theme toggle
- **Live Ticker**: Animated scrolling ticker showing latest 8 events
- **Metrics Row**: Total Events, New Events, Ongoing, and Outbreaks counts
- **Interactive Map**: Geographic visualization using PyDeck and Mapbox with different styles per theme
  - Light theme: `mapbox://styles/akanimo1/cld9l944e002g01oefypmh70y`
  - Dark theme: `mapbox://styles/akanimo1/cmj2p5vsl006401s5d32ofmnf`
- **Right Sidebar**: Recent signals feed with detailed event information and custom scrollbar
- **Responsive Design**: Beautiful neumorphic soft shadows (light) and sleek modern shadows (dark)

## Installation

1. Install required packages:
```bash
pip install -r requirements.txt
```

2. Set up Mapbox token:
   - Create a `.streamlit/secrets.toml` file in your project root
   - Add your Mapbox token: `MAPBOX_TOKEN = "your_token_here"`
   - Get a free token at https://account.mapbox.com/access-tokens/

## Usage

Run the application:
```bash
streamlit run app.py
```

The dashboard will open in your browser at http://localhost:8501

Click the theme toggle button in the header to switch between light and dark themes.

## Customization

### Data Source
Replace the `load_data()` function in app.py with your actual data source:
```python
@st.cache_data(ttl=1800)
def load_data():
    # Replace this URL with your data source
    url = "your_google_sheets_csv_url_or_api_endpoint"
    df = pd.read_csv(url)
    df['report_date'] = pd.to_datetime(df['report_date'])
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
- `report_date` - Date reported (datetime format)

### Theme Colors

**Light Theme:**
- Background: #e8eef5 (light blue-gray)
- Primary: #009edb (WHO blue)
- Secondary: #0056b3 (darker blue)
- Text: #2c3e50 (dark gray)

**Dark Theme:**
- Background: #0f1419 (dark blue-black)
- Cards: #1a1f26 (dark gray-blue)
- Primary: #3b82f6 (bright blue)
- Text: #e2e8f0 (light gray)

**Grade Colors (both themes):**
- Grade 3: #ff3355 (red)
- Grade 2: #ff9933 (orange)
- Grade 1: #ffcc00 (yellow)

## Layout

The application uses a three-column layout:
- **Left Sidebar** (280px): Filters and grade summary
- **Center Area**: Header, ticker, metrics, and map
- **Right Sidebar** (280px): Recent signals feed with styled scrollbar

## Advanced Features

### Theme Toggle
Click the theme toggle button in the header to switch between:
- **Light Mode**: Neumorphic design with soft shadows
- **Dark Mode**: Modern dark interface with vibrant accents

### Live Ticker
Animated horizontal scrolling ticker displays the latest 8 events with:
- Country name
- Disease type
- Grade classification
- Infinite loop animation

### AI Integration (Future)
The React version includes AI monitoring via Azure OpenAI. To add similar functionality to Streamlit:
1. Install `openai` package
2. Use Azure OpenAI API for analysis
3. Generate automated alerts based on anomaly detection

## Notes

- The demo includes sample data for 10 African countries
- Map uses PyDeck with custom Mapbox styles for each theme
- All filters are functional and update the map, metrics, and feed in real-time
- Theme state persists during the session using `st.session_state`
- The design exactly matches the Next.js version with full feature parity
- Custom scrollbar styling for right sidebar differs per theme
