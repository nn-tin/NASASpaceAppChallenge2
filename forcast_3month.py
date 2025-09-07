import requests
import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np

# --- 1. Hàm lấy dữ liệu từ NASA POWER ---
def get_nasa_power_data(lat, lon, start, end):
    url = (
        f"https://power.larc.nasa.gov/api/temporal/hourly/point"
        f"?parameters=T2M"
        f"&community=RE"
        f"&longitude={lon}"
        f"&latitude={lat}"
        f"&start={start}"
        f"&end={end}"
        f"&format=JSON"
    )
    response = requests.get(url).json()
    data = response["properties"]["parameter"]["T2M"]
    df = pd.DataFrame(list(data.items()), columns=["time", "temperature"])
    df["time"] = pd.to_datetime(df["time"], format="%Y%m%d%H")
    return df.sort_values("time").reset_index(drop=True)

# --- 2. Lấy dữ liệu 20 năm ---
lat, lon = 21.03, 105.85  # Hà Nội
df = get_nasa_power_data(lat, lon, start=20040101, end=20241231)

# --- 3. Tách train (2004–2022) và test (2023) ---
train_df = df[(df["time"] < "2023-01-01")]
test_df = df[(df["time"] >= "2023-01-01") & (df["time"] < "2024-01-01")]

# Chuẩn hóa cho Prophet
train_prophet = train_df.rename(columns={"time": "ds", "temperature": "y"})
test_prophet = test_df.rename(columns={"time": "ds", "temperature": "y"})

# --- 4. Train Prophet ---
model = Prophet(daily_seasonality=True, yearly_seasonality=True)
model.fit(train_prophet)

# --- 5. Dự báo năm 2023 (test set) ---
future_test = model.make_future_dataframe(periods=len(test_df), freq="h")  # h thay vì H
forecast_test = model.predict(future_test)

# Ghép dữ liệu thực tế và dự đoán cho năm 2023
merged = forecast_test.merge(test_prophet, on="ds", how="inner")
mae = mean_absolute_error(merged["y"], merged["yhat"])
rmse = np.sqrt(mean_squared_error(merged["y"], merged["yhat"]))
print(f"MAE (2023 test): {mae:.2f}, RMSE: {rmse:.2f}")

# --- 6. Vẽ dự đoán vs ground truth (2023) ---
plt.figure(figsize=(12,6))
plt.plot(merged["ds"], merged["y"], label="Ground Truth (2023)", color="black", alpha=0.6)
plt.plot(merged["ds"], merged["yhat"], label="Predicted (2023)", color="red")
plt.title("Temperature Prediction vs Ground Truth (2023) in Hanoi")
plt.xlabel("Date")
plt.ylabel("Temperature (°C)")
plt.legend()
plt.show()

# --- 7. Dự báo cho ngày mục tiêu năm 2024 ---
target_day = "2024-12-01"
future_2024 = model.make_future_dataframe(periods=24*365*2, freq="h")  # dự báo dài 2 năm
forecast_2024 = model.predict(future_2024)

one_day = forecast_2024[
    (forecast_2024["ds"] >= target_day) &
    (forecast_2024["ds"] < pd.to_datetime(target_day) + pd.Timedelta(days=1))
]

# --- 8. Vẽ dự báo cho ngày mục tiêu ---
plt.figure(figsize=(12,6))
plt.plot(one_day["ds"], one_day["yhat"], label="Predicted")
plt.fill_between(one_day["ds"], one_day["yhat_lower"], one_day["yhat_upper"], alpha=0.2)
plt.title(f"Temperature Prediction for {target_day} in Hanoi")
plt.xlabel("Hour")
plt.ylabel("Temperature (°C)")
ground_truth = test_prophet[
    (test_prophet["ds"] >= target_day) & 
    (test_prophet["ds"] < pd.to_datetime(target_day) + pd.Timedelta(days=1))
]
if not ground_truth.empty:
    plt.plot(
        ground_truth["ds"],
        ground_truth["y"],
        color="red", label="Ground Truth"
    )
plt.legend()
plt.show()
