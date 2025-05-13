import gspread
from oauth2client.service_account import ServiceAccountCredentials
import requests
from datetime import datetime

# --- CONFIGURATION ---
SHEET_NAME = "SiguldaTemperature"  # Your Google Sheets name
CITY = "Sigulda"  # The city you're checking the temperature for
API_KEY = "YOUR_OPENWEATHER_API_KEY"  # Replace with your OpenWeather API key
SERVICE_ACCOUNT_JSON = "creds.json"  # The name of your credentials file (downloaded from Google)

# --- GET TEMPERATURE ---
url = f"https://api.openweathermap.org/data/2.5/weather?q={CITY},LV&appid={API_KEY}&units=metric"
response = requests.get(url)
temp = response.json()["main"]["temp"]
timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

# --- CONNECT TO GOOGLE SHEETS ---
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_JSON, scope)
client = gspread.authorize(creds)
sheet = client.open(SHEET_NAME).sheet1

# --- ADD DATA TO SHEET ---
sheet.append_row([timestamp, temp])
print(f"Data added: {timestamp} - {temp}°C")
