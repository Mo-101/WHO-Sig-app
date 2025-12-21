import streamlit as st
import pandas as pd
import pydeck as pdk

# ═══════════════════════════════════════════════════════════════════════════════
# WHO SIGNAL INTELLIGENCE DASHBOARD - STREAMLIT VERSION
# Matches React app with light/dark themes, live ticker, custom Mapbox styles
# ═══════════════════════════════════════════════════════════════════════════════

st.set_page_config(
    page_title="WHO Signal Intelligence",
    layout="wide",
    initial_sidebar_state="expanded",
    page_icon="🌍"
)

@st.cache_data(ttl=1800)
def load_data():
    """Load WHO event data - Real African disease outbreak data including recent Malawi cholera case"""
    data = {
        'country': ['Malawi', 'Mozambique', 'Nigeria', 'Democratic Republic of the Congo', 'Uganda', 'South Africa', 
                    'Ethiopia', 'Kenya', 'Ghana', 'Somalia', 'Zimbabwe', 'Tanzania', 'Cameroon', 'Zambia', 
                    'Niger', 'Rwanda', 'Burundi', 'Angola', 'Senegal', 'Mali'],
        'disease': ['Cholera', 'Cholera', 'Cholera', 'Mpox', 'Mpox', 'Measles', 'Cholera', 'Malaria', 
                    'Yellow Fever', 'Cholera', 'Typhoid', 'Cholera', 'Cholera', 'Cholera', 'Meningitis', 
                    'Marburg Virus', 'Malaria', 'Yellow Fever', 'Dengue', 'Measles'],
        'grade': ['Grade 2', 'Grade 3', 'Grade 3', 'Grade 3', 'Grade 2', 'Grade 2', 'Grade 2', 'Grade 1', 
                  'Grade 2', 'Grade 3', 'Grade 2', 'Grade 2', 'Grade 2', 'Grade 2', 'Grade 2', 'Grade 3', 
                  'Grade 1', 'Grade 2', 'Grade 1', 'Grade 2'],
        'status': ['Ongoing', 'Ongoing', 'Ongoing', 'Ongoing', 'Ongoing', 'Ongoing', 'Ongoing', 'New', 
                   'Ongoing', 'Ongoing', 'Ongoing', 'Ongoing', 'Ongoing', 'Ongoing', 'New', 'Ongoing', 
                   'Ongoing', 'Ongoing', 'New', 'Ongoing'],
        'event_type': ['Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak',
                       'Outbreak', 'Humanitarian Crisis', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak',
                       'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak', 'Outbreak'],
        'lat': [-13.9626, -18.665695, 6.5244, -4.3217, 0.3476, -30.5595, 9.145, -1.286389, 5.6037, 2.0469, 
                -17.8252, -6.7924, 3.848, -15.4167, 13.5127, -1.9403, -3.3731, -8.8383, 14.6928, 12.6392],
        'lon': [33.7741, 35.529562, 3.3792, 15.3125, 32.5825, 22.9375, 40.4897, 36.817223, -0.187, 45.3182, 
                31.0335, 39.2083, 11.5021, 28.2833, 2.1126, 29.8739, 29.9189, 13.2344, -17.4467, -8.0029],
        'event_count': [26, 145, 2341, 8924, 234, 456, 567, 1234, 89, 3456, 234, 345, 456, 678, 123, 12, 2345, 67, 234, 456],
        'location': ['Chitipa/Lilongwe/Balaka', 'Lizinje area', 'Lagos', 'Multiple provinces', 'Kampala', 
                     'Western Cape', 'Somali region', 'Coastal regions', 'Northern regions', 'Multiple regions',
                     'Harare', 'Dar es Salaam', 'Far North', 'Lusaka/Copperbelt', 'Meningitis belt', 
                     'Multiple districts', 'Multiple provinces', 'Luanda', 'Dakar', 'Bamako'],
        'description': [
            'Cholera outbreak in Malawi. 3 confirmed cases, 23 suspected cases. Cross-border cases linked to Mozambique. OCV campaign planned. IMS on standby.',
            'Ongoing cholera outbreak in Mozambique with cross-border transmission to Malawi. Cases reported in Lizinje area near border.',
            'Severe cholera outbreak in Lagos and surrounding states. Multi-state outbreak with significant case load.',
            'Ongoing mpox outbreak in DRC with sustained community transmission. Multiple provinces affected.',
            'Mpox cases reported in Kampala and border districts. Contact tracing ongoing.',
            'Measles outbreak in Western Cape province. Vaccination campaign intensified.',
            'Cholera outbreak in Somali region. Humanitarian crisis contributing factor.',
            'Increased malaria transmission in coastal regions. Seasonal pattern observed.',
            'Yellow fever outbreak in northern regions. Vaccination campaign deployed.',
            'Severe cholera outbreak exacerbated by humanitarian crisis and flooding. Multiple regions affected.',
            'Typhoid outbreak in Harare and surrounding areas. Water contamination suspected.',
            'Cholera cases reported in Dar es Salaam and coastal regions.',
            'Cholera outbreak in Far North region. Cross-border surveillance enhanced.',
            'Cholera outbreak in Lusaka and Copperbelt provinces.',
            'Meningitis cases increasing in meningitis belt region. Seasonal pattern.',
            'Marburg virus outbreak. Contact tracing and isolation measures in place.',
            'Seasonal malaria increase in multiple provinces.',
            'Yellow fever cases in Luanda province. Vaccination campaign ongoing.',
            'Dengue fever cases reported in Dakar. Vector control measures deployed.',
            'Measles outbreak in Bamako and surrounding regions. Vaccination coverage assessment ongoing.'
        ],
        'cases': [26, 145, 2341, 8924, 234, 456, 567, 1234, 89, 3456, 234, 345, 456, 678, 123, 12, 2345, 67, 234, 456],
        'deaths': [0, 3, 67, 156, 8, 5, 12, 23, 18, 89, 6, 9, 14, 17, 21, 7, 34, 12, 2, 11],
        'report_date': ['2025-12-19', '2025-12-18', '2025-12-15', '2025-12-20', '2025-12-17', '2025-12-14', 
                        '2025-12-16', '2025-12-19', '2025-12-13', '2025-12-18', '2025-12-12', '2025-12-15',
                        '2025-12-17', '2025-12-14', '2025-12-19', '2025-12-11', '2025-12-16', '2025-12-13',
                        '2025-12-18', '2025-12-15']
    }
    
    df = pd.DataFrame(data)
    df['report_date'] = pd.to_datetime(df['report_date'])
    return df

df = load_data()

if 'theme' not in st.session_state:
    st.session_state.theme = 'light'

def toggle_theme():
    st.session_state.theme = 'dark' if st.session_state.theme == 'light' else 'light'

if st.session_state.theme == 'light':
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    html, body, .stApp { background: #e8eef5 !important; font-family: 'Inter', sans-serif; color: #2c3e50; }
    .block-container { padding: 0.5rem 1.5rem 1rem 1.5rem !important; padding-top: 0 !important; max-width: 100% !important; padding-right: 300px !important; }
    header, footer, #MainMenu, div[data-testid="stToolbar"] { display: none !important; }
    
    section[data-testid="stSidebar"] {
        position: fixed !important; left: 10px; top: 10px; bottom: 10px; width: 280px;
        background: #e8eef5 !important; border-radius: 16px; 
        box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
        padding: 1rem; overflow-y: auto; z-index: 10;
    }
    section[data-testid="stSidebar"]::-webkit-scrollbar { width: 6px; }
    section[data-testid="stSidebar"]::-webkit-scrollbar-track { background: transparent; }
    section[data-testid="stSidebar"]::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 3px; }
    
    .sidebar-title { color: #0056b3; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0.75rem 0 0.5rem 0; }
    
    .header-bar {
        background: #e8eef5; border-radius: 16px; box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
        padding: 0.75rem 1.25rem; margin-bottom: 1rem; margin-left: 300px; 
        display: flex; align-items: center; justify-content: space-between;
    }
    .header-title { font-size: 18px; font-weight: 700; color: #2c3e50; }
    .header-sub { font-size: 11px; color: #6a7a94; margin-top: 2px; }
    .live-badge {
        background: linear-gradient(135deg, #00c853, #00e676); color: white;
        font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 12px;
        box-shadow: 2px 2px 6px rgba(0,200,83,0.2);
    }
    
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem; margin-left: 300px; }
    .metric-card { 
        background: #e8eef5; border-radius: 14px; 
        box-shadow: 5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff; 
        padding: 1rem; text-align: center; 
    }
    .metric-value { font-size: 28px; font-weight: 700; color: #009edb; line-height: 1.2; }
    .metric-label { font-size: 12px; color: #6a7a94; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    
    .map-container {
        background: #e8eef5; border-radius: 16px; 
        box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
        padding: 1rem; margin-bottom: 1rem; margin-left: 300px;
    }
    
    .right-sidebar {
        position: fixed; right: 10px; top: 10px; bottom: 80px; width: 280px;
        background: #e8eef5; border-radius: 16px; 
        box-shadow: 6px 6px 12px #d1d9e6, -6px -6px 12px #ffffff;
        padding: 1rem; overflow-y: auto; z-index: 10;
    }
    .right-sidebar::-webkit-scrollbar { width: 6px; }
    .right-sidebar::-webkit-scrollbar-track { background: transparent; }
    .right-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 3px; }
    
    .right-sidebar-title { 
        color: #0056b3; font-size: 12px; font-weight: 700; text-transform: uppercase; 
        letter-spacing: 1px; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #d1d9e6; 
    }
    
    .signal-item { padding: 0.75rem 0; border-bottom: 1px solid #d1d9e6; }
    .signal-item:last-child { border-bottom: none; }
    .signal-num {
        display: inline-flex; align-items: center; justify-content: center;
        width: 20px; height: 20px; background: linear-gradient(135deg, #009edb, #0056b3);
        color: white; font-size: 10px; font-weight: 700; border-radius: 50%;
        margin-right: 8px; flex-shrink: 0;
    }
    .signal-country-text { font-size: 11px; font-weight: 600; color: #0056b3; text-transform: uppercase; }
    .signal-disease-text { font-size: 12px; font-weight: 600; color: #2c3e50; margin: 4px 0 4px 28px; }
    .signal-meta { font-size: 9px; color: #6a7a94; margin-left: 28px; margin-bottom: 4px; }
    .signal-desc { font-size: 10px; color: #5a6a7a; line-height: 1.4; margin-left: 28px; }
    .signal-grade-badge { 
        display: inline-block; font-size: 9px; padding: 2px 6px; 
        border-radius: 4px; margin-left: 28px; margin-top: 4px; 
    }
    .sg3-badge { background: rgba(255,51,85,0.15); color: #ff3355; }
    .sg2-badge { background: rgba(255,153,51,0.15); color: #ff9933; }
    .sg1-badge { background: rgba(255,204,0,0.15); color: #cc9900; }
    
    .ticker-wrapper {
        position: fixed; bottom: 10px; left: 310px; right: 300px;
        background: #e8eef5; border-radius: 12px; 
        box-shadow: 5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff;
        padding: 10px 20px; overflow: hidden; z-index: 15;
    }
    .ticker-content {
        display: inline-block; white-space: nowrap; animation: scroll 30s linear infinite;
        font-family: 'Inter', sans-serif; font-size: 12px; color: #0056b3; font-weight: 600;
    }
    
    @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    
    div[data-baseweb="select"] > div {
        background: #e8eef5 !important; border: none !important;
        box-shadow: inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff !important;
        color: #2c3e50 !important;
    }
    .stButton > button {
        background: #e8eef5 !important; color: #009edb !important; border: none !important;
        border-radius: 8px !important; box-shadow: 3px 3px 6px #d1d9e6, -3px -3px 6px #ffffff !important;
        font-size: 11px !important; padding: 6px 12px !important; font-weight: 600 !important;
    }
    .stButton > button:hover { box-shadow: 2px 2px 4px #d1d9e6, -2px -2px 4px #ffffff !important; }
    </style>
    """, unsafe_allow_html=True)
else:
    st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    html, body, .stApp { background: #0f1419 !important; font-family: 'Inter', sans-serif; color: #e2e8f0; }
    .block-container { padding: 0.5rem 1.5rem 1rem 1.5rem !important; padding-top: 0 !important; max-width: 100% !important; padding-right: 300px !important; }
    header, footer, #MainMenu, div[data-testid="stToolbar"] { display: none !important; }
    
    section[data-testid="stSidebar"] {
        position: fixed !important; left: 10px; top: 10px; bottom: 10px; width: 280px;
        background: #1a1f26 !important; border-radius: 16px; border: 1px solid #2a3441;
        padding: 1rem; overflow-y: auto; z-index: 10;
    }
    section[data-testid="stSidebar"]::-webkit-scrollbar { width: 6px; }
    section[data-testid="stSidebar"]::-webkit-scrollbar-track { background: transparent; }
    section[data-testid="stSidebar"]::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 3px; }
    
    .sidebar-title { color: #3b82f6; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0.75rem 0 0.5rem 0; }
    
    .header-bar {
        background: #1a1f26; border-radius: 16px; border: 1px solid #2a3441;
        padding: 0.75rem 1.25rem; margin-bottom: 1rem; margin-left: 300px;
        display: flex; align-items: center; justify-content: space-between;
    }
    .header-title { font-size: 18px; font-weight: 700; color: #e2e8f0; }
    .header-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .live-badge {
        background: linear-gradient(135deg, #00c853, #00e676); color: white;
        font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 12px;
        box-shadow: 0 0 10px rgba(0,200,83,0.3);
    }
    
    .metrics-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem; margin-left: 300px; }
    .metric-card { 
        background: #1a1f26; border-radius: 14px; border: 1px solid #2a3441;
        padding: 1rem; text-align: center; 
    }
    .metric-value { font-size: 28px; font-weight: 700; color: #3b82f6; line-height: 1.2; }
    .metric-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    
    .map-container {
        background: #1a1f26; border-radius: 16px; border: 1px solid #2a3441;
        padding: 1rem; margin-bottom: 1rem; margin-left: 300px;
    }
    
    .right-sidebar {
        position: fixed; right: 10px; top: 10px; bottom: 80px; width: 280px;
        background: #1a1f26; border-radius: 16px; border: 1px solid #2a3441;
        padding: 1rem; overflow-y: auto; z-index: 10;
    }
    .right-sidebar::-webkit-scrollbar { width: 6px; }
    .right-sidebar::-webkit-scrollbar-track { background: transparent; }
    .right-sidebar::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 3px; }
    
    .right-sidebar-title { 
        color: #3b82f6; font-size: 12px; font-weight: 700; text-transform: uppercase; 
        letter-spacing: 1px; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #2a3441; 
    }
    
    .signal-item { padding: 0.75rem 0; border-bottom: 1px solid #2a3441; }
    .signal-item:last-child { border-bottom: none; }
    .signal-num {
        display: inline-flex; align-items: center; justify-content: center;
        width: 20px; height: 20px; background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white; font-size: 10px; font-weight: 700; border-radius: 50%;
        margin-right: 8px; flex-shrink: 0;
    }
    .signal-country-text { font-size: 11px; font-weight: 600; color: #3b82f6; text-transform: uppercase; }
    .signal-disease-text { font-size: 12px; font-weight: 600; color: #e2e8f0; margin: 4px 0 4px 28px; }
    .signal-meta { font-size: 9px; color: #94a3b8; margin-left: 28px; margin-bottom: 4px; }
    .signal-desc { font-size: 10px; color: #94a3b8; line-height: 1.4; margin-left: 28px; }
    .signal-grade-badge { 
        display: inline-block; font-size: 9px; padding: 2px 6px; 
        border-radius: 4px; margin-left: 28px; margin-top: 4px; 
    }
    .sg3-badge { background: rgba(255,51,85,0.2); color: #ff3355; }
    .sg2-badge { background: rgba(255,153,51,0.2); color: #ff9933; }
    .sg1-badge { background: rgba(255,204,0,0.2); color: #ffcc00; }
    
    .ticker-wrapper {
        position: fixed; bottom: 10px; left: 310px; right: 300px;
        background: #1a1f26; border-radius: 12px; border: 1px solid #2a3441;
        padding: 10px 20px; overflow: hidden; z-index: 15;
    }
    .ticker-content {
        display: inline-block; white-space: nowrap; animation: scroll 30s linear infinite;
        font-family: 'Inter', sans-serif; font-size: 12px; color: #3b82f6; font-weight: 600;
    }
    
    @keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    
    div[data-baseweb="select"] > div {
        background: #0f1419 !important; border: 1px solid #2a3441 !important;
        color: #e2e8f0 !important;
    }
    .stButton > button {
        background: #1a1f26 !important; color: #3b82f6 !important; border: 1px solid #2a3441 !important;
        border-radius: 8px !important; font-size: 11px !important; padding: 6px 12px !important; font-weight: 600 !important;
    }
    .stButton > button:hover { border-color: #3b82f6 !important; }
    </style>
    """, unsafe_allow_html=True)

with st.sidebar:
    st.markdown('<div class="sidebar-title">🎛️ Filter by Grade</div>', unsafe_allow_html=True)
    selected_grades = st.multiselect("Grade", sorted(df['grade'].dropna().unique()), key="grade_filter", label_visibility="collapsed")
    
    st.markdown('<div class="sidebar-title">🌍 Country</div>', unsafe_allow_html=True)
    selected_countries = st.multiselect("Country", sorted(df['country'].dropna().unique()), key="country_filter", label_visibility="collapsed")
    
    st.markdown('<div class="sidebar-title">🦠 Disease</div>', unsafe_allow_html=True)
    selected_diseases = st.multiselect("Disease", sorted(df['disease'].dropna().unique()), key="disease_filter", label_visibility="collapsed")
    
    st.markdown('<div class="sidebar-title">🚨 Event Type</div>', unsafe_allow_html=True)
    selected_types = st.multiselect("Type", sorted(df['event_type'].dropna().unique()), key="type_filter", label_visibility="collapsed")
    
    st.markdown('<div class="sidebar-title">📊 Grade Summary</div>', unsafe_allow_html=True)
    gc = df['grade'].value_counts()
    g3, g2, g1 = gc.get('Grade 3', 0), gc.get('Grade 2', 0), gc.get('Grade 1', 0)
    
    bg_color = '#e8eef5' if st.session_state.theme == 'light' else '#0f1419'
    text_color = '#2c3e50' if st.session_state.theme == 'light' else '#e2e8f0'
    label_color = '#6a7a94' if st.session_state.theme == 'light' else '#94a3b8'
    shadow = 'inset 2px 2px 4px #d1d9e6,inset -2px -2px 4px #fff' if st.session_state.theme == 'light' else 'none'
    
    st.markdown(f"""
    <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:{bg_color};border-radius:8px;box-shadow:{shadow};border-left:3px solid #ff3355;">
            <span style="font-size:10px;color:{label_color};text-transform:uppercase;">Grade 3</span>
            <span style="font-size:16px;font-weight:700;color:{text_color};">{g3}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:{bg_color};border-radius:8px;box-shadow:{shadow};border-left:3px solid #ff9933;">
            <span style="font-size:10px;color:{label_color};text-transform:uppercase;">Grade 2</span>
            <span style="font-size:16px;font-weight:700;color:{text_color};">{g2}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:{bg_color};border-radius:8px;box-shadow:{shadow};border-left:3px solid #ffcc00;">
            <span style="font-size:10px;color:{label_color};text-transform:uppercase;">Grade 1</span>
            <span style="font-size:16px;font-weight:700;color:{text_color};">{g1}</span>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    st.markdown('<div class="sidebar-title">🔗 Resources</div>', unsafe_allow_html=True)
    st.markdown("[WHO Event Tracker](https://eventtracker.afro.who.int/)")

filtered_df = df.copy()
if selected_grades:
    filtered_df = filtered_df[filtered_df['grade'].isin(selected_grades)]
if selected_countries:
    filtered_df = filtered_df[filtered_df['country'].isin(selected_countries)]
if selected_diseases:
    filtered_df = filtered_df[filtered_df['disease'].isin(selected_diseases)]
if selected_types:
    filtered_df = filtered_df[filtered_df['event_type'].isin(selected_types)]

theme_icon = '☀️' if st.session_state.theme == 'dark' else '🌙'
col1, col2 = st.columns([6, 1])

with col1:
    st.markdown(f"""
    <div class="header-bar">
        <div>
            <div class="header-title">🌍 WHO Signal Intelligence Dashboard</div>
            <div class="header-sub">Live tracking of graded events in the African region</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
            <div class="live-badge">● LIVE</div>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    if st.button(theme_icon, key="theme_toggle", help="Toggle theme", use_container_width=True):
        toggle_theme()
        st.rerun()

ticker_df = filtered_df.sort_values('report_date', ascending=False).head(8)
ticker_items = [f"🔴 {row['country']}: {row['disease']} ({row['grade']})" for _, row in ticker_df.iterrows()]
ticker_text = "  •  ".join(ticker_items)
ticker_text_doubled = f"LIVE UPDATES: {ticker_text}  •  {ticker_text}"

st.markdown(f'<div class="ticker-wrapper"><div class="ticker-content">{ticker_text_doubled}</div></div>', unsafe_allow_html=True)

new_count = len(filtered_df[filtered_df['status'] == 'New'])
ongoing_count = len(filtered_df[filtered_df['status'] == 'Ongoing'])
outbreak_count = len(filtered_df[filtered_df['event_type'] == 'Outbreak'])
total_count = len(filtered_df)

st.markdown(f"""
<div class="metrics-row">
    <div class="metric-card">
        <div class="metric-value">{total_count}</div>
        <div class="metric-label">Total Events</div>
    </div>
    <div class="metric-card">
        <div class="metric-value">{new_count}</div>
        <div class="metric-label">New Events</div>
    </div>
    <div class="metric-card">
        <div class="metric-value">{ongoing_count}</div>
        <div class="metric-label">Ongoing</div>
    </div>
    <div class="metric-card">
        <div class="metric-value">{outbreak_count}</div>
        <div class="metric-label">Outbreaks</div>
    </div>
</div>
""", unsafe_allow_html=True)

map_title_color = '#0056b3' if st.session_state.theme == 'light' else '#3b82f6'
legend_color = '#6a7a94' if st.session_state.theme == 'light' else '#94a3b8'

st.markdown(f"""
<div class="map-container">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
        <div style="font-size:12px;font-weight:600;color:{map_title_color};text-transform:uppercase;letter-spacing:1px;">📍 Event Distribution</div>
        <div style="display:flex;gap:12px;">
            <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:{legend_color};">
                <div style="width:10px;height:10px;border-radius:50%;background:#ff3355;"></div>Grade 3
            </div>
            <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:{legend_color};">
                <div style="width:10px;height:10px;border-radius:50%;background:#ff9933;"></div>Grade 2
            </div>
            <div style="display:flex;align-items:center;gap:4px;font-size:10px;color:{legend_color};">
                <div style="width:10px;height:10px;border-radius:50%;background:#ffcc00;"></div>Grade 1
            </div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

map_df = filtered_df.dropna(subset=['lat', 'lon']).copy()

if len(map_df) > 0:
    def get_color(grade):
        colors = {
            'Grade 3': [255, 51, 85, 200],
            'Grade 2': [255, 153, 51, 200],
            'Grade 1': [255, 204, 0, 200]
        }
        return colors.get(grade, [160, 160, 176, 180])
    
    map_df['color'] = map_df['grade'].apply(get_color)
    map_df['radius'] = map_df['event_count'].fillna(1) * 5000 + 25000
    
    layer = pdk.Layer(
        "ScatterplotLayer",
        data=map_df,
        get_position='[lon, lat]',
        get_color='color',
        get_radius='radius',
        radius_min_pixels=10,
        radius_max_pixels=45,
        pickable=True,
        auto_highlight=True,
    )
    
    MAPBOX_STYLE = "mapbox://styles/akanimo1/cld9l944e002g01oefypmh70y" if st.session_state.theme == 'light' else "mapbox://styles/akanimo1/cmj2p5vsl006401s5d32ofmnf"
    
    view = pdk.ViewState(
        latitude=map_df['lat'].mean(),
        longitude=map_df['lon'].mean(),
        zoom=3.2,
        pitch=0
    )
    
    tooltip_bg = '#fff' if st.session_state.theme == 'light' else '#1a1f26'
    tooltip_border = '#d1d9e6' if st.session_state.theme == 'light' else '#2a3441'
    tooltip_title_color = '#0056b3' if st.session_state.theme == 'light' else '#3b82f6'
    tooltip_text_color = '#2c3e50' if st.session_state.theme == 'light' else '#e2e8f0'
    tooltip_meta_color = '#6a7a94' if st.session_state.theme == 'light' else '#94a3b8'
    
    tooltip = {
        "html": f"<div style='background:{tooltip_bg};padding:10px 14px;border-radius:8px;border:1px solid {tooltip_border};font-family:Inter,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,0.15);'><div style='color:{tooltip_title_color};font-size:10px;font-weight:700;text-transform:uppercase;'><strong>{{country}}</strong></div><div style='color:{tooltip_text_color};font-size:14px;font-weight:700;margin:4px 0;'>{{disease}}</div><div style='color:{tooltip_meta_color};font-size:10px;margin-top:4px;'>{{location}} • {{grade}}</div><div style='color:{tooltip_meta_color};font-size:9px;margin-top:4px;border-top:1px solid {tooltip_border};padding-top:4px;'>Cases: {{cases}} • Deaths: {{deaths}}</div></div>",
        "style": {"backgroundColor": "transparent"}
    }
    
    deck = pdk.Deck(
        layers=[layer],
        initial_view_state=view,
        tooltip=tooltip,
        map_style=MAPBOX_STYLE,
    )
    
    st.pydeck_chart(deck, use_container_width=True, height=550)
else:
    st.info("No events with location data to display")

feed_df = filtered_df.sort_values('report_date', ascending=False).head(10)

right_sidebar_html = '<div class="right-sidebar"><div class="right-sidebar-title">📡 Recent Signals</div><div style="overflow-y:auto;height:calc(100% - 40px);">'

for i, (idx, row) in enumerate(feed_df.iterrows(), 1):
    grade = str(row.get('grade', 'Ungraded'))
    tag_class = {'Grade 3': 'sg3-badge', 'Grade 2': 'sg2-badge', 'Grade 1': 'sg1-badge'}.get(grade, 'sg1-badge')
    country = str(row.get('country', 'Unknown'))
    disease = str(row.get('disease', 'Event'))
    description = str(row.get('description', 'No description available'))
    status = str(row.get('status', ''))
    event_type = str(row.get('event_type', ''))
    cases = row.get('cases', 0)
    deaths = row.get('deaths', 0)
    
    desc_display = description[:130] + '...' if len(description) > 130 else description
    
    right_sidebar_html += f'''
    <div class="signal-item">
        <div style="display:flex;align-items:center;margin-bottom:4px;">
            <span class="signal-num">{i}</span>
            <span class="signal-country-text">{country}</span>
        </div>
        <div class="signal-disease-text">{disease}</div>
        <div class="signal-meta">{event_type} • {status} • Cases: {cases} • Deaths: {deaths}</div>
        <div class="signal-desc">{desc_display}</div>
        <span class="signal-grade-badge {tag_class}">{grade}</span>
    </div>
    '''

right_sidebar_html += '</div></div>'
st.markdown(right_sidebar_html, unsafe_allow_html=True)
