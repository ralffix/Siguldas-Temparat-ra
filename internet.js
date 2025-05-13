import gspread
from oauth2client.service_account import ServiceAccountCredentials
import requests
from datetime import datetime

# --- CONFIG ---
LAT = 57.153
LON = 24.861
SHEET_NAME = "SiguldaTemperature"
SERVICE_ACCOUNT_FILE = "creds.json"
TIMEZONE = "Europe/Riga"

# --- GET HOURLY TEMPERATURE FROM OPEN-METEO ---
url = f"https://api.open-meteo.com/v1/forecast?latitude={LAT}&longitude={LON}&hourly=temperature_2m&timezone={TIMEZONE}"
response = requests.get(url)
data = response.json()

# --- EXTRACT TODAY'S 12:00 TEMPERATURE ---
hourly_times = data["hourly"]["time"]
hourly_temps = data["hourly"]["temperature_2m"]

# Find today's date in format YYYY-MM-DD
today_str = datetime.now().strftime("%Y-%m-%d")
target_hour = f"{today_str}T12:00"

if target_hour in hourly_times:
    index = hourly_times.index(target_hour)
    temp = hourly_temps[index]
    timestamp = target_hour
else:
    # Fallback: just use the most recent available hour
    temp = hourly_temps[-1]
    timestamp = hourly_times[-1]

# --- CONNECT TO GOOGLE SHEETS ---
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
client = gspread.authorize(creds)
sheet = client.open(SHEET_NAME).sheet1

# --- WRITE TO SHEET ---
sheet.append_row([timestamp, temp])
print(f"Logged: {timestamp} - {temp}°C")
