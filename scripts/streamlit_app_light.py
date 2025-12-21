import streamlit as st
import pandas as pd
import pydeck as pdk

# ═══════════════════════════════════════════════════════════════════════════════
# WHO Signal Intelligence Dashboard - Light Neumorphic Theme
# ═══════════════════════════════════════════════════════════════════════════════

st.set_page_config(
    page_title="WHO Signal Intelligence",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="🌍"
)

# ═══════════════════════════════════════════════════════════════════════════════
# LOAD DATA
# ═══════════════════════════════════════════════════════════════════════════════
@st.cache_data(ttl=3600)
def load_data():
    """Load WHO event data from Google Sheets"""
    url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZWLeXBFUhH05FAjiJeZZxoGtm-coEqBASMOz_UrUt_VQeewe9qbOXYZmLQcJTJitOk5nd14zVCQAx/pub?output=csv"
    df = pd.read_csv(url)
    
    # Clean column names
    df.columns = df.columns.str.upper()
    
    # Add year if weekline exists
    if 'WEEKLINE' in df.columns:
        df['YEAR'] = df['WEEKLINE'].str.extract(r'(\d{4})').astype(float).astype('Int64')
    
    # Parse dates
    if 'REPORT_DATE' in df.columns:
        df['REPORT_DATE'] = pd.to_datetime(df['REPORT_DATE'], dayfirst=True, errors='coerce')
    
    return df

df = load_data()

# ═══════════════════════════════════════════════════════════════════════════════
# CSS STYLING - Neumorphic Light Theme
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Global */
html, body, .stApp {
    background: #e8eef5 !important;
    font-family: 'Inter', sans-serif;
}

.block-container {
    padding: 0.5rem 1.5rem 1rem 1.5rem !important;
    max-width: 100% !important;
}

header, footer, #MainMenu, div[data-testid="stToolbar"] { 
    display: none !important; 
}

/* Neumorphic shadows */
.neu-card {
    background: #e8eef5;
    border-radius: 16px;
    box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
    padding: 1rem;
}

.neu-inset {
    background: #e8eef5;
    border-radius: 12px;
    box-shadow: inset 4px 4px 8px #d1d9e6, inset -4px -4px 8px #ffffff;
    padding: 0.75rem;
}

/* Sidebar */
section[data-testid="stSidebar"] {
    background: #e8eef5;
    border-radius: 16px;
    box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
}

.sidebar-title {
    color: #0056b3;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0.5rem 0;
}

/* Header */
.header-bar {
    background: #e8eef5;
    border-radius: 16px;
    box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
    padding: 0.75rem 1.25rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.header-title {
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
}

.live-badge {
    background: linear-gradient(135deg, #00c853, #00e676);
    color: white;
    font-size: 10px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 12px;
}

/* Metrics */
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
}

.metric-label {
    font-size: 12px;
    color: #6a7a94;
    text-transform: uppercase;
}

/* Grade colors */
.grade-3 { color: #ff3355; }
.grade-2 { color: #ff9933; }
.grade-1 { color: #ffcc00; }
.grade-u { color: #a0a0b0; }
</style>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# SIDEBAR FILTERS
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown('<div class="sidebar-title">🎛️ Filter by Grade</div>', unsafe_allow_html=True)
    selected_grades = st.multiselect("Grade", sorted(df['GRADE'].dropna().unique()) if 'GRADE' in df.columns else [], key="gr", label_visibility="collapsed")
    
    st.markdown('<div class="sidebar-title">📅 Year</div>', unsafe_allow_html=True)
    if 'YEAR' in df.columns:
        years = sorted(df['YEAR'].dropna().unique(), reverse=True)
        selected_year = st.selectbox("Year", years, key="yr", label_visibility="collapsed")
    else:
        selected_year = None
    
    st.markdown('<div class="sidebar-title">🚨 Event Type</div>', unsafe_allow_html=True)
    if 'EVENT_TYPE' in df.columns:
        selected_types = st.multiselect("Type", sorted(df['EVENT_TYPE'].dropna().unique()), key="et", label_visibility="collapsed")
    else:
        selected_types = []
    
    st.markdown('<div class="sidebar-title">🌍 Country</div>', unsafe_allow_html=True)
    if 'COUNTRY' in df.columns:
        selected_countries = st.multiselect("Country", sorted(df['COUNTRY'].dropna().unique()), key="co", label_visibility="collapsed")
    else:
        selected_countries = []
    
    st.markdown('<div class="sidebar-title">🦠 Disease</div>', unsafe_allow_html=True)
    if 'DISEASE' in df.columns:
        selected_diseases = st.multiselect("Disease", sorted(df['DISEASE'].dropna().unique()), key="ds", label_visibility="collapsed")
    else:
        selected_diseases = []
    
    # Grade Summary
    st.markdown('<div class="sidebar-title">📊 Grade Summary</div>', unsafe_allow_html=True)
    if 'GRADE' in df.columns:
        gc = df['GRADE'].value_counts()
        g3 = gc.get('Grade 3', 0)
        g2 = gc.get('Grade 2', 0)
        g1 = gc.get('Grade 1', 0)
        gu = gc.get('Ungraded', 0)
    else:
        g3 = g2 = g1 = gu = 0
    
    st.markdown(f"""
    <div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;padding:6px 10px;background:#e8eef5;border-radius:8px;box-shadow:inset 2px 2px 4px #d1d9e6,inset -2px -2px 4px #fff;border-left:3px solid #ff3355;">
            <span style="font-size:10px;color:#6a7a94;">Grade 3</span>
            <span style="font-size:16px;font-weight:700;color:#2c3e50;">{g3}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 10px;background:#e8eef5;border-radius:8px;box-shadow:inset 2px 2px 4px #d1d9e6,inset -2px -2px 4px #fff;border-left:3px solid #ff9933;">
            <span style="font-size:10px;color:#6a7a94;">Grade 2</span>
            <span style="font-size:16px;font-weight:700;color:#2c3e50;">{g2}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 10px;background:#e8eef5;border-radius:8px;box-shadow:inset 2px 2px 4px #d1d9e6,inset -2px -2px 4px #fff;border-left:3px solid #ffcc00;">
            <span style="font-size:10px;color:#6a7a94;">Grade 1</span>
            <span style="font-size:16px;font-weight:700;color:#2c3e50;">{g1}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:6px 10px;background:#e8eef5;border-radius:8px;box-shadow:inset 2px 2px 4px #d1d9e6,inset -2px -2px 4px #fff;border-left:3px solid #a0a0b0;">
            <span style="font-size:10px;color:#6a7a94;">Ungraded</span>
            <span style="font-size:16px;font-weight:700;color:#2c3e50;">{gu}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# FILTER DATA
# ═══════════════════════════════════════════════════════════════════════════════
filtered_df = df.copy()
if selected_year and 'YEAR' in filtered_df.columns:
    filtered_df = filtered_df[filtered_df['YEAR'] == selected_year]
if selected_grades:
    filtered_df = filtered_df[filtered_df['GRADE'].isin(selected_grades)]
if selected_types:
    filtered_df = filtered_df[filtered_df['EVENT_TYPE'].isin(selected_types)]
if selected_countries:
    filtered_df = filtered_df[filtered_df['COUNTRY'].isin(selected_countries)]
if selected_diseases:
    filtered_df = filtered_df[filtered_df['DISEASE'].isin(selected_diseases)]

# ═══════════════════════════════════════════════════════════════════════════════
# HEADER
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<div class="header-bar">
    <div>
        <div class="header-title">🌍 WHO Signal Intelligence Dashboard</div>
        <div style="font-size:11px;color:#6a7a94;">Live tracking of graded events in the African region</div>
    </div>
    <div class="live-badge">● LIVE</div>
</div>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# METRICS
# ═══════════════════════════════════════════════════════════════════════════════
col1, col2, col3, col4 = st.columns(4)

with col1:
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{len(filtered_df)}</div>
        <div class="metric-label">Total Events</div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    new_count = len(filtered_df[filtered_df['STATUS'] == 'New']) if 'STATUS' in filtered_df.columns else 0
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{new_count}</div>
        <div class="metric-label">New Events</div>
    </div>
    """, unsafe_allow_html=True)

with col3:
    ongoing = len(filtered_df[filtered_df['STATUS'] == 'Ongoing']) if 'STATUS' in filtered_df.columns else 0
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{ongoing}</div>
        <div class="metric-label">Ongoing</div>
    </div>
    """, unsafe_allow_html=True)

with col4:
    outbreaks = len(filtered_df[filtered_df['EVENT_TYPE'] == 'Outbreak']) if 'EVENT_TYPE' in filtered_df.columns else 0
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{outbreaks}</div>
        <div class="metric-label">Outbreaks</div>
    </div>
    """, unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
# MAP
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown('<div style="height:20px;"></div>', unsafe_allow_html=True)

if 'LAT' in filtered_df.columns and 'LON' in filtered_df.columns:
    # Prepare map data
    map_df = filtered_df.dropna(subset=['LAT', 'LON']).copy()
    
    # Color mapping for grades
    def get_color(grade):
        colors = {
            'Grade 3': [255, 51, 85],
            'Grade 2': [255, 153, 51],
            'Grade 1': [255, 204, 0],
            'Ungraded': [160, 160, 176]
        }
        return colors.get(grade, [160, 160, 176])
    
    map_df['color'] = map_df['GRADE'].apply(get_color) if 'GRADE' in map_df.columns else [[160, 160, 176]] * len(map_df)
    
    # Create map
    st.pydeck_chart(pdk.Deck(
        map_style='mapbox://styles/mapbox/light-v11',
        initial_view_state=pdk.ViewState(
            latitude=0,
            longitude=20,
            zoom=2,
            pitch=0,
        ),
        layers=[
            pdk.Layer(
                'ScatterplotLayer',
                data=map_df,
                get_position='[LON, LAT]',
                get_color='color',
                get_radius=50000,
                pickable=True,
                auto_highlight=True,
            ),
        ],
        tooltip={
            'html': '<b>{COUNTRY}</b><br/>{DISEASE}<br/>{GRADE}',
            'style': {'color': 'white', 'backgroundColor': '#2c3e50'}
        }
    ))
else:
    st.info("No geographic data available for mapping.")

st.markdown("---")
st.caption("Data updates every hour • WHO African Region")
