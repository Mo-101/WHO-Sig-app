import streamlit as st
import pandas as pd
import pydeck as pdk

# ═══════════════════════════════════════════════════════════════════════════════
# 1. CONFIG - Always first
# ═══════════════════════════════════════════════════════════════════════════════
st.set_page_config(
    page_title="WHO Signal Intelligence - Dark",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="🌍"
)

# ═══════════════════════════════════════════════════════════════════════════════
# 2. SAMPLE DATA (replace with your actual data loading)
# ═══════════════════════════════════════════════════════════════════════════════
@st.cache_data
def load_data():
    # Replace this with your actual data loading logic
    return pd.DataFrame({
        'country': ['Nigeria', 'Kenya', 'South Africa', 'Ethiopia'],
        'disease': ['Cholera', 'Ebola', 'Measles', 'Yellow Fever'],
        'grade': ['Grade 3', 'Grade 2', 'Grade 1', 'Grade 3'],
        'lat': [9.08, -0.02, -30.55, 9.14],
        'lon': [8.67, 37.90, 22.93, 40.48],
        'event_count': [150, 75, 30, 200],
        'status': ['Ongoing', 'New', 'Ongoing', 'New'],
        'event_type': ['Outbreak', 'Outbreak', 'Epidemic', 'Outbreak'],
        'location': ['Lagos', 'Nairobi', 'Cape Town', 'Addis Ababa'],
        'description': ['Cholera outbreak affecting multiple regions', 'New Ebola cases reported', 'Measles outbreak in urban areas', 'Yellow fever emergency declared']
    })

df = load_data()

# ═══════════════════════════════════════════════════════════════════════════════
# 3. DARK THEME STYLING
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* === GLOBAL DARK === */
html, body, .stApp {
    background: #0f1419 !important;
    font-family: 'Inter', sans-serif;
    color: #e8eef5;
}
.block-container {
    padding: 0.5rem 1.5rem 1rem 1.5rem !important;
    padding-top: 0 !important;
    max-width: 100% !important;
}
header, footer, #MainMenu, div[data-testid="stToolbar"] { display: none !important; }
div[data-testid="stAppViewBlockContainer"] { padding-top: 0.5rem !important; }

/* === DARK CARD BASE === */
.dark-card {
    background: #1a1f26;
    border-radius: 16px;
    border: 1px solid #2a3441;
    padding: 1rem;
}

/* === LEFT SIDEBAR DARK === */
section[data-testid="stSidebar"] {
    background: #1a1f26 !important;
    border-right: 1px solid #2a3441;
}
section[data-testid="stSidebar"] > div { 
    padding: 0.5rem 1rem !important;
    background: #1a1f26 !important;
}

.sidebar-title {
    color: #3b82f6;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 1rem 0 0.5rem 0;
}

/* Streamlit widget styling for dark theme */
.stMultiSelect, .stSelectbox {
    background: #0f1419 !important;
}
div[data-baseweb="select"] > div {
    background: #0f1419 !important;
    border: 1px solid #2a3441 !important;
    color: #e8eef5 !important;
}

/* === HEADER DARK === */
.header-bar {
    background: #1a1f26;
    border-radius: 16px;
    border: 1px solid #2a3441;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.header-title {
    font-size: 18px;
    font-weight: 700;
    color: #e8eef5;
}
.header-sub {
    font-size: 11px;
    color: #8b949e;
}
.live-badge {
    background: linear-gradient(135deg, #00c853, #00e676);
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(0,200,83,0.3);
}

/* === METRICS DARK === */
.metrics-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
}
.metric-card {
    background: #1a1f26;
    border-radius: 14px;
    border: 1px solid #2a3441;
    padding: 1rem;
    text-align: center;
}
.metric-value {
    font-size: 28px;
    font-weight: 700;
    color: #3b82f6;
    line-height: 1.2;
}
.metric-label {
    font-size: 12px;
    color: #8b949e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
}

/* === GRADE SUMMARY DARK === */
.grade-summary-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #0f1419;
    border-radius: 8px;
    border: 1px solid #2a3441;
    margin-bottom: 6px;
}
.grade-label {
    font-size: 10px;
    color: #8b949e;
}
.grade-value {
    font-size: 16px;
    font-weight: 700;
    color: #e8eef5;
}

/* === MAP DARK === */
.map-container {
    background: #1a1f26;
    border-radius: 16px;
    border: 1px solid #2a3441;
    padding: 1rem;
    margin-bottom: 1rem;
}
.map-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    margin-bottom: 0.5rem;
}
.map-title {
    font-size: 12px;
    font-weight: 600;
    color: #3b82f6;
    text-transform: uppercase;
    letter-spacing: 1px;
}

/* KPI Overlay on Map - Dark */
.kpi-overlay {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 999;
    display: flex;
    gap: 12px;
    pointer-events: none;
}
.kpi-overlay-card {
    background: rgba(26, 31, 38, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 12px;
    border: 1px solid #2a3441;
    padding: 12px 18px;
    min-width: 100px;
    text-align: center;
    pointer-events: auto;
}
.kpi-overlay-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: #3b82f6;
    display: block;
    line-height: 1;
}
.kpi-overlay-label {
    font-size: 0.7rem;
    color: #8b949e;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
}

/* === RIGHT SIDEBAR DARK === */
.right-sidebar {
    position: fixed;
    right: 10px;
    top: 10px;
    bottom: 10px;
    width: 280px;
    background: #1a1f26;
    border-radius: 16px;
    border: 1px solid #2a3441;
    padding: 1rem;
    overflow: hidden;
    z-index: 10;
    display: flex;
    flex-direction: column;
}
.right-sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px;
}
.right-sidebar-title {
    color: #3b82f6;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #2a3441;
}
.signal-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid #2a3441;
}
.signal-item:last-child {
    border-bottom: none;
}
.signal-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-size: 10px;
    font-weight: 700;
    border-radius: 50%;
    margin-right: 8px;
    flex-shrink: 0;
}
.signal-header {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
}
.signal-country-text {
    font-size: 11px;
    font-weight: 600;
    color: #3b82f6;
    text-transform: uppercase;
}
.signal-disease-text {
    font-size: 12px;
    font-weight: 600;
    color: #e8eef5;
    margin: 4px 0 4px 28px;
}
.signal-meta {
    font-size: 9px;
    color: #8b949e;
    margin-left: 28px;
    margin-bottom: 4px;
}
.signal-desc {
    font-size: 10px;
    color: #8b949e;
    line-height: 1.4;
    margin-left: 28px;
}
.signal-grade-badge {
    display: inline-block;
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 28px;
    margin-top: 4px;
}
.sg3-badge { background: rgba(255,51,85,0.2); color: #ff3355; }
.sg2-badge { background: rgba(255,153,51,0.2); color: #ff9933; }
.sg1-badge { background: rgba(255,204,0,0.2); color: #ffcc00; }
.sgu-badge { background: rgba(160,160,176,0.2); color: #8b949e; }

/* Adjust main content for right sidebar */
.block-container {
    padding-right: 300px !important;
}

/* === TICKER DARK === */
.ticker-wrapper {
    position: fixed;
    bottom: 10px;
    left: 10px;
    right: 300px;
    background: #1a1f26;
    border-radius: 12px;
    border: 1px solid #2a3441;
    padding: 10px 20px;
    overflow: hidden;
    z-index: 15;
}
.ticker-content {
    display: inline-block;
    white-space: nowrap;
    animation: scroll 30s linear infinite;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    color: #3b82f6;
    font-weight: 500;
}
@keyframes scroll {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}

/* Button styling */
.stButton > button {
    background: #1a1f26 !important;
    color: #3b82f6 !important;
    border: 1px solid #2a3441 !important;
    border-radius: 8px !important;
    font-size: 10px !important;
    padding: 4px 10px !important;
}
.stButton > button:hover {
    background: #2a3441 !important;
}
</style>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# 4. SIDEBAR - Filters
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown('<div class="sidebar-title">🎛️ Filter by Grade</div>', unsafe_allow_html=True)
    selected_grades = st.multiselect("Grade", sorted(df['grade'].dropna().unique()), key="gr", label_visibility="collapsed")
    
    st.markdown('<div class="sidebar-title">🌍 Country</div>', unsafe_allow_html=True)
    selected_countries = st.multiselect("Country", sorted(df['country'].dropna().unique()), key="co", label_visibility="collapsed")
    
    st.markdown('<div class="sidebar-title">🦠 Disease</div>', unsafe_allow_html=True)
    selected_diseases = st.multiselect("Disease", sorted(df['disease'].dropna().unique()), key="ds", label_visibility="collapsed")
    
    st.markdown('<div class="sidebar-title">🚨 Event Type</div>', unsafe_allow_html=True)
    selected_types = st.multiselect("Type", sorted(df['event_type'].dropna().unique()), key="et", label_visibility="collapsed")
    
    # GRADE SUMMARY IN SIDEBAR
    st.markdown('<div class="sidebar-title">📊 Grade Summary</div>', unsafe_allow_html=True)
    gc = df['grade'].value_counts()
    g3, g2, g1 = gc.get('Grade 3', 0), gc.get('Grade 2', 0), gc.get('Grade 1', 0)
    
    st.markdown(f"""
    <div style="display:flex;flex-direction:column;gap:6px;">
        <div class="grade-summary-item" style="border-left:3px solid #ff3355;">
            <span class="grade-label">Grade 3</span><span class="grade-value">{g3}</span>
        </div>
        <div class="grade-summary-item" style="border-left:3px solid #ff9933;">
            <span class="grade-label">Grade 2</span><span class="grade-value">{g2}</span>
        </div>
        <div class="grade-summary-item" style="border-left:3px solid #ffcc00;">
            <span class="grade-label">Grade 1</span><span class="grade-value">{g1}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown('<div class="sidebar-title">🔗 Resources</div>', unsafe_allow_html=True)
    st.markdown("[WHO Event Tracker](https://eventtracker.afro.who.int/)")

# ═══════════════════════════════════════════════════════════════════════════════
# 5. FILTER DATA
# ═══════════════════════════════════════════════════════════════════════════════
filtered_df = df.copy()
if selected_grades:
    filtered_df = filtered_df[filtered_df['grade'].isin(selected_grades)]
if selected_types:
    filtered_df = filtered_df[filtered_df['event_type'].isin(selected_types)]
if selected_countries:
    filtered_df = filtered_df[filtered_df['country'].isin(selected_countries)]
if selected_diseases:
    filtered_df = filtered_df[filtered_df['disease'].isin(selected_diseases)]

# ═══════════════════════════════════════════════════════════════════════════════
# 6. HEADER
# ═══════════════════════════════════════════════════════════════════════════════
col_header1, col_header2 = st.columns([4, 1])
with col_header1:
    st.markdown("""
    <div class="header-bar">
        <div>
            <div class="header-title">🌍 WHO Signal Intelligence Dashboard</div>
            <div class="header-sub">Live tracking of graded events in the African region</div>
        </div>
        <div class="live-badge">● LIVE</div>
    </div>
    """, unsafe_allow_html=True)
with col_header2:
    if st.button("🔄 Refresh Data", key="refresh", use_container_width=True):
        st.cache_data.clear()
        st.rerun()

# ═══════════════════════════════════════════════════════════════════════════════
# 7. METRICS
# ═══════════════════════════════════════════════════════════════════════════════
new_count = len(filtered_df[filtered_df['status'] == 'New'])
ongoing_count = len(filtered_df[filtered_df['status'] == 'Ongoing'])
outbreak_count = len(filtered_df[filtered_df['event_type'] == 'Outbreak'])
total_count = len(filtered_df)

st.markdown(f"""
<div class="metrics-row">
    <div class="metric-card"><div class="metric-value">{total_count}</div><div class="metric-label">Total Events</div></div>
    <div class="metric-card"><div class="metric-value">{new_count}</div><div class="metric-label">New Events</div></div>
    <div class="metric-card"><div class="metric-value">{ongoing_count}</div><div class="metric-label">Ongoing</div></div>
    <div class="metric-card"><div class="metric-value">{outbreak_count}</div><div class="metric-label">Outbreaks</div></div>
</div>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# 8. MAP
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<div class="map-container">
    <div class="map-header">
        <div class="map-title">📍 Event Distribution</div>
    </div>
</div>
""", unsafe_allow_html=True)

map_df = filtered_df.dropna(subset=['lat', 'lon']).copy()

if len(map_df) > 0:
    def get_color(grade):
        colors = {'Grade 3': [255,51,85,200], 'Grade 2': [255,153,51,200], 'Grade 1': [255,204,0,200]}
        return colors.get(grade, [160,160,176,180])
    
    map_df['color'] = map_df['grade'].apply(get_color)
    map_df['radius'] = map_df['event_count'].fillna(1) * 5000 + 20000
    
    layer = pdk.Layer(
        "ScatterplotLayer",
        data=map_df,
        get_position='[lon, lat]',
        get_color='color',
        get_radius='radius',
        radius_min_pixels=5,
        radius_max_pixels=30,
        pickable=True,
        auto_highlight=True,
    )
    
    # Use dark map style
    view = pdk.ViewState(
        latitude=map_df['lat'].mean(),
        longitude=map_df['lon'].mean(),
        zoom=3,
        pitch=0
    )
    
    tooltip = {
        "html": "<div style='background:#1a1f26;padding:8px 12px;border-radius:8px;border:1px solid #2a3441;font-family:Inter,sans-serif;'><div style='color:#3b82f6;font-size:10px;font-weight:600;'>{country}</div><div style='color:#e8eef5;font-size:13px;font-weight:600;margin:3px 0;'>{disease}</div><div style='color:#8b949e;font-size:10px;'>{location} • {grade}</div></div>",
        "style": {"backgroundColor": "transparent"}
    }

    r = pdk.Deck(
        layers=[layer],
        initial_view_state=view,
        tooltip=tooltip,
        map_style="mapbox://styles/mapbox/dark-v11",
    )
    
    # KPI Overlay on Map
    countries_affected = filtered_df['country'].nunique()
    st.markdown(f'''
    <div class="kpi-overlay">
        <div class="kpi-overlay-card">
            <span class="kpi-overlay-value">{len(filtered_df)}</span>
            <span class="kpi-overlay-label">Active Events</span>
        </div>
        <div class="kpi-overlay-card">
            <span class="kpi-overlay-value">{countries_affected}</span>
            <span class="kpi-overlay-label">Countries</span>
        </div>
    </div>
    ''', unsafe_allow_html=True)
    
    st.pydeck_chart(r, use_container_width=True, height=530)
else:
    st.info("No events with location data")

# ═══════════════════════════════════════════════════════════════════════════════
# 9. RIGHT SIDEBAR - Recent Signals
# ═══════════════════════════════════════════════════════════════════════════════
feed_df = filtered_df.head(10)

right_sidebar_html = '<div class="right-sidebar"><div class="right-sidebar-title">📡 Recent Signals</div><div class="right-sidebar-content">'

for i, (idx, row) in enumerate(feed_df.iterrows(), 1):
    grade = str(row.get('grade', 'Ungraded'))
    tag = {'Grade 3': 'sg3-badge', 'Grade 2': 'sg2-badge', 'Grade 1': 'sg1-badge'}.get(grade, 'sgu-badge')
    country = str(row.get('country', 'Unknown'))
    disease = str(row.get('disease', 'Event'))
    description = str(row.get('description', ''))
    status = str(row.get('status', ''))
    event_type = str(row.get('event_type', ''))
    
    desc_display = description[:150] + '...' if len(description) > 150 else description
    
    right_sidebar_html += f'''
    <div class="signal-item">
        <div class="signal-header">
            <span class="signal-num">{i}</span>
            <span class="signal-country-text">{country}</span>
        </div>
        <div class="signal-disease-text">{disease}</div>
        <div class="signal-meta">{event_type} • {status}</div>
        <div class="signal-desc">{desc_display}</div>
        <span class="signal-grade-badge {tag}">{grade}</span>
    </div>
    '''

right_sidebar_html += '</div></div>'
st.markdown(right_sidebar_html, unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# 10. LIVE TICKER
# ═══════════════════════════════════════════════════════════════════════════════
ticker_df = filtered_df.head(8)
ticker_items = [f"🔴 {r.get('country','')}: {r.get('disease','')} ({r.get('grade','')})" for _, r in ticker_df.iterrows()]
ticker_text = "  •  ".join(ticker_items)

st.markdown(f'''
<div class="ticker-wrapper">
    <div class="ticker-content">{ticker_text}</div>
</div>
''', unsafe_allow_html=True)
