import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression


def get_pollution_data(ocean_name):
    try:
        df = pd.read_csv('ocean_plastic_pollution_data.csv')
        df['Date'] = pd.to_datetime(df['Date'], dayfirst=True)
    except Exception as e:
        return {"error": "Dataset loading failed"}

    # Check valid ocean
    if ocean_name not in df['Region'].unique():
        return {"error": "Invalid ocean name"}

    # Filter data
    ocean_df = df[df['Region'] == ocean_name].sort_values('Date')

    #  POLLUTION INDEX (MPI)
    ocean_avg = df.groupby('Region')['Plastic_Weight_kg'].mean().reset_index()

    min_val = ocean_avg['Plastic_Weight_kg'].min()
    max_val = ocean_avg['Plastic_Weight_kg'].max()

    ocean_avg['MPI'] = ((ocean_avg['Plastic_Weight_kg'] - min_val) / (max_val - min_val)) * 100

    selected_mpi = float(
        ocean_avg[ocean_avg['Region'] == ocean_name]['MPI'].values[0]
    )

    #  RISK LEVEL
    if selected_mpi < 33:
        risk = "Low"
    elif selected_mpi < 66:
        risk = "Moderate"
    else:
        risk = "High"

    #  TREND GRAPH DATA
    ocean_df = ocean_df.set_index('Date')
    monthly = ocean_df['Plastic_Weight_kg'].resample('ME').mean().dropna()

    labels = monthly.index.strftime('%Y-%m').tolist()
    values = monthly.values.tolist()

    #  FUTURE PREDICTION (optional but powerful)
    if len(monthly) > 2:
        X = np.arange(len(monthly)).reshape(-1, 1)
        y = monthly.values

        model = LinearRegression()
        model.fit(X, y)

        future_X = np.arange(len(monthly), len(monthly) + 6).reshape(-1, 1)
        predictions = model.predict(future_X)

        future_dates = pd.date_range(
            start=monthly.index[-1], periods=7, freq='ME'
        )[1:]

        # Append future data
        labels += future_dates.strftime('%Y-%m').tolist()
        values += predictions.tolist()

    #  FINAL RESPONSE
    return {
        "ocean": ocean_name,
        "pollution_index": round(selected_mpi, 2),
        "risk": risk,
        "confidence": 0.9,  # Placeholder confidence score
        "graph": {
            "labels": labels,
            "values": [round(v, 2) for v in values]
        }
    }