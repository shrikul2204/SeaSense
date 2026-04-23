import pandas as pd

# -------------------------------
# LOAD DATA (run once)
# -------------------------------
df = pd.read_csv("Indian_water_data.csv")

# -------------------------------
# PREPROCESSING
# -------------------------------
params_map = {
    'Temp': ['Temperature (C) - Min', 'Temperature (C) - Max'],
    'DO': ['Dissolved - Min', 'Dissolved - Max'],
    'PH': ['pH - Min', 'pH - Max'],
    'BOD': ['BOD (mg/L) - Min', 'BOD (mg/L) - Max']
}

for feature, cols in params_map.items():
    for col in cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    df[feature] = df[cols].mean(axis=1)

# Fill missing values
df[list(params_map.keys())] = df[list(params_map.keys())].fillna(
    df[list(params_map.keys())].median()
)

# -------------------------------
# WQI CALCULATION
# -------------------------------
def calculate_wqi(row):
    q_do = 100 * (row['DO'] / 10)
    q_ph = 100 * (abs(row['PH'] - 7) / 1.5)
    q_bod = 100 * (row['BOD'] / 3)

    wqi = (0.3 * q_do) + (0.3 * q_ph) + (0.4 * q_bod)
    return wqi


def calculate_survival(row):
    return 1 if (row['DO'] >= 5.0 and 6.5 < row['PH'] < 8.5) else 0


# Apply once
df['WQI'] = df.apply(calculate_wqi, axis=1)
df['Is_Safe'] = df.apply(calculate_survival, axis=1)

# -------------------------------
# MAIN FUNCTION (API USE)
# -------------------------------
def get_freshwater_data(state):

    state = state.upper()
    state_df = df[df['State Name'] == state]

    if state_df.empty:
        return {"error": "State not found"}

    # Aggregated values
    avg_wqi = state_df['WQI'].mean()
    survival_rate = state_df['Is_Safe'].mean() * 100

    # Risk classification
    if avg_wqi < 50:
        risk = "Low"
    elif avg_wqi < 100:
        risk = "Moderate"
    elif avg_wqi < 200:
        risk = "High"
    else:
        risk = "Critical"

    # Confidence (based on survival stability)
    confidence = round(survival_rate / 100, 2)

    # Trend graph (group by year if available)
    if 'Year' in state_df.columns:
        trend = state_df.groupby('Year')['WQI'].mean().reset_index()
        labels = trend['Year'].astype(str).tolist()
        values = trend['WQI'].round(2).tolist()
    else:
        # fallback
        labels = list(range(len(state_df)))
        values = state_df['WQI'].round(2).tolist()

    graph = {
        "labels": labels,
        "values": values
    }

    return {
        "pollution_index": round(avg_wqi, 2),
        "confidence": 0.9,
        "risk": risk,
        "graph": graph
    }