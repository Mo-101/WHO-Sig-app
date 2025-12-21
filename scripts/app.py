import streamlit as st
import pandas as pd
import pydeck as pdk
import plotly.express as px
import plotly.graph_objects as go

# ═══════════════════════════════════════════════════════════════════════════════
# 1. CONFIG - Always first
# ═══════════════════════════════════════════════════════════════════════════════
st.set_page_config(
    page_title="WHO Signal Intelligence",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="🌍"
)

# ═══════════════════════════════════════════════════════════════════════════════
# 2. DATA - Load early, cache it
# ═══════════════════════════════════════════════════════════════════════════════
@st.cache_data(ttl=1800)
def load_data():
    """Load WHO event data from CSV source"""
    url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQXx3hWPjGHfC_example/pub?gid=0&single=true&output=csv"
    
    # For demo purposes, create sample data
    data = {
        'country': ['Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Ethiopia', 'Uganda', 'Tanzania', 'DRC'],
        'disease': ['Cholera', 'Ebola', 'COVID-19', 'Measles', 'Yellow Fever', 'Cholera', 'Dengue', 'Mpox'],
        'grade': ['Grade 3', 'Grade 3', 'Grade 2', 'Grade 1', 'Grade 2', 'Grade 1', 'Grade 2', 'Grade 3'],
        'status': ['Ongoing', 'New', 'Ongoing', 'Ongoing', 'New', 'Ongoing', 'New', 'Ongoing'],
        'event_type': ['Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak'],
        'lat': [0.0236, 9.0765, -30.5595, 7.9465, 9.1450, 1.3733, -6.3690, -4.0383],
        'lon': [37.9062, 7.3986, 22.9375, -1.0232, 40.4897, 32.2903, 34.8888, 21.7587],
        'event_count': [150, 50, 200, 30, 80, 45, 25, 120],
        'location': ['Nairobi', 'Lagos', 'Johannesburg', 'Accra', 'Addis Ababa', 'Kampala', 'Dar es Salaam', 'Kinshasa'],
        'description': ['Ongoing cholera outbreak in urban areas', 'New Ebola cases reported', 'COVID-19 surge continues', 'Measles outbreak in rural region', 'Yellow fever cases increasing', 'Cholera outbreak near lake', 'Dengue fever outbreak', 'Mpox cases detected'],
        'year': [2025, 2025, 2025, 2025, 2025, 2025, 2025, 2025],
        'report_date': ['2025-01-15', '2025-01-20', '2025-01-18', '2025-01-10', '2025-01-19', '2025-01-12', '2025-01-21', '2025-01-17']
    }
    
    df = pd.DataFrame(data)
    df['report_date'] = pd.to_datetime(df['report_date'])
    return df

df = load_data()

# ═══════════════════════════════════════════════════════════════════════════════
# 3. CSS - All styles in one block
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* === GLOBAL === */
html, body, .stApp {
    background: #e8eef5 !important;
    font-family: 'Inter', sans-serif;
}
.block-container {
    padding: 0.5rem 1.5rem 1rem 1.5rem !important;
    padding-top: 0 !important;
    max-width: 100% !important;
    padding-right: 300px !important;
}
header, footer, #MainMenu, div[data-testid="stToolbar"] { display: none !important; }
div[data-testid="stAppViewBlockContainer"] { padding-top: 0.5rem !important; }

/* === NEUMORPHIC BASE === */
.neu-card {
    background: #e8eef5;
    border-radius: 16px;
    box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
    padding: 1rem;
}

/* === LEFT SIDEBAR === */
section[data-testid="stSidebar"] {
    position: fixed;
    left: 10px;
    top: 10px;
    bottom: 10px;
    width: 280px;
    background: #e8eef5;
    border-radius: 16px;
    box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
    padding: 1rem;
    overflow: hidden;
    z-index: 10;
}
section[data-testid="stSidebar"] > div { 
    padding: 0.5rem 1rem !important;
    height: 100%;
    overflow-y: auto;
}

.sidebar-title {
    color: #0056b3;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0.75rem 0 0.5rem 0;
}

/* === HEADER === */
.header-bar {
    background: #e8eef5;
    border-radius: 16px;
    box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    margin-left: 300px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.header-title {
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
}
.header-sub {
    font-size: 11px;
    color: #6a7a94;
}
.live-badge {
    background: linear-gradient(135deg, #00c853, #00e676);
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 12px;
}

/* === METRICS === */
.metrics-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1rem;
    margin-left: 300px;
}
.metric-card {
    background: #e8eef5;
    border-radius: 14px;
    box-shadow: 5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff;
    padding: 1rem;
    text-align: center;
}
.metric-value {
    font-size: 28px;
    font-weight: 700;
    color: #009edb;
    line-height: 1.2;
}
.metric-label {
    font-size: 12px;
    color: #6a7a94;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 4px;
}

/* === MAP === */
.map-container {
    background: #e8eef5;
    border-radius: 16px;
    box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
    padding: 1rem;
    margin-bottom: 1rem;
    margin-left: 300px;
}

div[data-testid="stDeckGlJsonChart"] {
    border-radius: 16px;
    overflow: hidden;
}

/* === RIGHT SIDEBAR === */
.right-sidebar {
    position: fixed;
    right: 10px;
    top: 10px;
    bottom: 10px;
    width: 280px;
    background: #e8eef5;
    border-radius: 16px;
    box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
    padding: 1rem;
    overflow: hidden;
    z-index: 10;
}
.right-sidebar-content {
    height: calc(100% - 40px);
    overflow-y: auto;
    padding-right: 4px;
}
.right-sidebar-title {
    color: #0056b3;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #d1d9e6;
}
.signal-item {
    padding: 0.75rem 0;
    border-bottom: 1px solid #d1d9e6;
}
.signal-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, #009edb, #0056b3);
    color: white;
    font-size: 10px;
    font-weight: 700;
    border-radius: 50%;
    margin-right: 8px;
}
.signal-country-text {
    font-size: 11px;
    font-weight: 600;
    color: #0056b3;
    text-transform: uppercase;
}
.signal-disease-text {
    font-size: 12px;
    font-weight: 600;
    color: #2c3e50;
    margin: 4px 0 4px 28px;
}
.signal-meta {
    font-size: 9px;
    color: #6a7a94;
    margin-left: 28px;
}
.signal-desc {
    font-size: 10px;
    color: #5a6a7a;
    line-height: 1.4;
    margin-left: 28px;
    margin-top: 4px;
}
.signal-grade-badge {
    display: inline-block;
    font-size: 9px;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 28px;
    margin-top: 4px;
}
.sg3-badge { background: rgba(255,51,85,0.15); color: #ff3355; font-weight: 600; }
.sg2-badge { background: rgba(255,153,51,0.15); color: #ff9933; font-weight: 600; }
.sg1-badge { background: rgba(255,204,0,0.15); color: #cc9900; font-weight: 600; }
.sgu-badge { background: rgba(160,160,176,0.15); color: #6a7a94; font-weight: 600; }

/* Button styling */
.stButton > button {
    background: #e8eef5 !important;
    color: #009edb !important;
    border: none !important;
    border-radius: 8px !important;
    box-shadow: 3px 3px 6px #d1d9e6, -3px -3px 6px #ffffff !important;
    font-size: 11px !important;
    padding: 6px 12px !important;
    font-weight: 600 !important;
}

/* === LIVE TICKER === */
.ticker-wrapper {
    background: linear-gradient(90deg, #e8eef5 0%, #d1d9e6 50%, #e8eef5 100%);
    overflow: hidden;
    white-space: nowrap;
    border-radius: 12px;
    padding: 8px 0;
    margin-bottom: 1rem;
    margin-left: 300px;
    box-shadow: 3px 3px 6px #d1d9e6, -3px -3px 6px #ffffff;
}

.ticker-content {
    display: inline-block;
    animation: ticker 30s linear infinite;
    padding-left: 100%;
    font-size: 11px;
    font-weight: 600;
    color: #0056b3;
    letter-spacing: 0.5px;
}

@keyframes ticker {
    0% {
        transform: translateX(0);
    }
    100% {
        transform: translateX(-50%);
    }
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
    
    # GRADE SUMMARY
    st.markdown('<div class="sidebar-title">📊 Grade Summary</div>', unsafe_allow_html=True)
    gc = df['grade'].value_counts()
    g3, g2, g1 = gc.get('Grade 3', 0), gc.get('Grade 2', 0), gc.get('Grade 1', 0)
    
    st.markdown(f"""
    <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#e8eef5;border-radius:8px;box-shadow:inset 2px 2px 4px #d1d9e6,inset -2px -2px 4px #fff;border-left:3px solid #ff3355;">
            <span style="font-size:10px;color:#6a7a94;">Grade 3</span><span style="font-size:16px;font-weight:700;color:#2c3e50;">{g3}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#e8eef5;border-radius:8px;box-shadow:inset 2px 2px 4px #d1d9e6,inset -2px -2px 4px #fff;border-left:3px solid #ff9933;">
            <span style="font-size:10px;color:#6a7a94;">Grade 2</span><span style="font-size:16px;font-weight:700;color:#2c3e50;">{g2}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;background:#e8eef5;border-radius:8px;box-shadow:inset 2px 2px 4px #d1d9e6,inset -2px -2px 4px #fff;border-left:3px solid #ffcc00;">
            <span style="font-size:10px;color:#6a7a94;">Grade 1</span><span style="font-size:16px;font-weight:700;color:#2c3e50;">{g1}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# 5. FILTER DATA
# ═══════════════════════════════════════════════════════════════════════════════
filtered_df = df.copy()
if selected_grades:
    filtered_df = filtered_df[filtered_df['grade'].isin(selected_grades)]
if selected_countries:
    filtered_df = filtered_df[filtered_df['country'].isin(selected_countries)]
if selected_diseases:
    filtered_df = filtered_df[filtered_df['disease'].isin(selected_diseases)]
if selected_types:
    filtered_df = filtered_df[filtered_df['event_type'].isin(selected_types)]

# ═══════════════════════════════════════════════════════════════════════════════
# 6. HEADER
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<div class="header-bar">
    <div>
        <div class="header-title">🌍 WHO Signal Intelligence Dashboard</div>
        <div class="header-sub">Live tracking of graded events in the African region</div>
    </div>
    <div class="live-badge">● LIVE</div>
</div>
""", unsafe_allow_html=True)

ticker_df = filtered_df.sort_values('report_date', ascending=False).head(8) if 'report_date' in filtered_df.columns else filtered_df.head(8)
ticker_items = [f"🔴 {r.get('country','')}: {r.get('disease','')} ({r.get('grade','')})" for _, r in ticker_df.iterrows()]
ticker_text = "  •  ".join(ticker_items)
ticker_text_doubled = f"LIVE UPDATES: {ticker_text}  •  {ticker_text}"

st.markdown(f'''
<div class="ticker-wrapper">
    <div class="ticker-content">{ticker_text_doubled}</div>
</div>
''', unsafe_allow_html=True)

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
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
        <div style="font-size:12px;font-weight:600;color:#0056b3;text-transform:uppercase;letter-spacing:1px;">📍 Event Distribution</div>
        <div style="display:flex;gap:12px;">
            <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#6a7a94;"><div style="width:10px;height:10px;border-radius:50%;background:#ff3355;"></div>Grade 3</div>
            <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#6a7a94;"><div style="width:10px;height:10px;border-radius:50%;background:#ff9933;"></div>Grade 2</div>
            <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:#6a7a94;"><div style="width:10px;height:10px;border-radius:50%;background:#ffcc00;"></div>Grade 1</div>
        </div>
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
        radius_min_pixels=8,
        radius_max_pixels=40,
        pickable=True,
        auto_highlight=True,
    )
    
    MAPBOX_STYLE = "mapbox://styles/akanimo1/cld9l944e002g01oefypmh70y"
    
    view = pdk.ViewState(
        latitude=map_df['lat'].mean(),
        longitude=map_df['lon'].mean(),
        zoom=3,
        pitch=0
    )
    
    tooltip = {
        "html": "<div style='background:#fff;padding:8px 12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-family:Inter,sans-serif;'><div style='color:#0056b3;font-size:10px;font-weight:600;'>{country}</div><div style='color:#2c3e50;font-size:13px;font-weight:600;margin:3px 0;'>{disease}</div><div style='color:#6a7a94;font-size:10px;'>{location} • {grade}</div></div>",
        "style": {"backgroundColor": "transparent"}
    }
    
    r = pdk.Deck(
        layers=[layer],
        initial_view_state=view,
        tooltip=tooltip,
        map_style=MAPBOX_STYLE,
    )
    
    st.pydeck_chart(r, use_container_width=True)

# ═══════════════════════════════════════════════════════════════════════════════
# 9. RIGHT SIDEBAR - Recent Signals
# ═══════════════════════════════════════════════════════════════════════════════
feed_df = filtered_df.sort_values('report_date', ascending=False).head(10)

right_sidebar_html = '<div class="right-sidebar"><div class="right-sidebar-title">📡 Recent Signals</div><div class="right-sidebar-content">'

for i, (idx, row) in enumerate(feed_df.iterrows(), 1):
    grade = str(row.get('grade', 'Ungraded'))
    tag = {'Grade 3': 'sg3-badge', 'Grade 2': 'sg2-badge', 'Grade 1': 'sg1-badge'}.get(grade, 'sgu-badge')
    country = str(row.get('country', 'Unknown'))
    disease = str(row.get('disease', 'Event'))
    description = str(row.get('description', ''))
    status = str(row.get('status', ''))
    event_type = str(row.get('event_type', ''))
    
    desc_display = description[:120] + '...' if len(description) > 120 else description
    
    right_sidebar_html += f'''
    <div class="signal-item">
        <div style="display:flex;align-items:center;margin-bottom:4px;">
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
