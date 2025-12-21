import pandas as pd

# Load the data from the URL
url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQZWLeXBFUhH05FAjiJeZZxoGtm-coEqBASMOz_UrUt_VQeewe9qbOXYZmLQcJTJitOk5nd14zVCQAx/pub?output=csv"

print("📊 Loading data from WHO Event Tracker...")
print(f"URL: {url}\n")

try:
    df = pd.read_csv(url)
    
    print("=" * 80)
    print("DATASET OVERVIEW")
    print("=" * 80)
    print(f"Total rows: {len(df)}")
    print(f"Total columns: {len(df.columns)}\n")
    
    print("=" * 80)
    print("COLUMN NAMES")
    print("=" * 80)
    for i, col in enumerate(df.columns, 1):
        print(f"{i:2d}. {col}")
    
    print("\n" + "=" * 80)
    print("DATA TYPES")
    print("=" * 80)
    print(df.dtypes)
    
    print("\n" + "=" * 80)
    print("FIRST 3 ROWS OF DATA")
    print("=" * 80)
    # Display first 3 rows with all columns
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', None)
    pd.set_option('display.max_colwidth', 50)
    print(df.head(3))
    
    print("\n" + "=" * 80)
    print("KEY COLUMNS SAMPLE DATA")
    print("=" * 80)
    
    # Check for important columns
    important_cols = ['country', 'disease', 'grade', 'event_type', 'status', 
                      'description', 'cases', 'deaths', 'lat', 'lon', 'report_date']
    
    for col in important_cols:
        if col in df.columns:
            print(f"\n{col.upper()}:")
            print(f"  - Unique values: {df[col].nunique()}")
            print(f"  - Missing values: {df[col].isna().sum()}")
            print(f"  - Sample values: {df[col].dropna().unique()[:5].tolist()}")
        else:
            print(f"\n{col.upper()}: ❌ NOT FOUND IN DATASET")
    
    print("\n" + "=" * 80)
    print("CHECKING FOR HTML IN DESCRIPTION COLUMN")
    print("=" * 80)
    
    if 'description' in df.columns:
        html_pattern = df['description'].astype(str).str.contains('<', na=False)
        html_count = html_pattern.sum()
        print(f"Rows with HTML tags in description: {html_count} out of {len(df)}")
        
        if html_count > 0:
            print("\nSample descriptions with HTML:")
            for idx, desc in enumerate(df[html_pattern]['description'].head(3), 1):
                print(f"\n{idx}. {desc[:200]}...")
    
    print("\n" + "=" * 80)
    print("NULL VALUE SUMMARY")
    print("=" * 80)
    null_summary = df.isnull().sum()
    null_summary = null_summary[null_summary > 0].sort_values(ascending=False)
    if len(null_summary) > 0:
        for col, count in null_summary.items():
            pct = (count / len(df)) * 100
            print(f"{col}: {count} ({pct:.1f}%)")
    else:
        print("No missing values found!")
        
except Exception as e:
    print(f"❌ Error loading data: {e}")
    import traceback
    traceback.print_exc()
