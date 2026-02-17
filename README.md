# React Native Weather App 

This application is a Weather Forecast tool built with React Native, Expo, and SQLite. It allows users to view weather for their current location, search for cities, and save up to 5 favorite locations for quick access.

## 📱 Features

* **Current Location:** Automatically fetches and displays weather based on device GPS using `expo-location`.
* **Search & Display:** Allows users to search for any city to view its current weather details.
* **Favorites List:** Users can save up to **5 cities** to a persistent list.
* **Local Storage:** Uses `expo-sqlite` to ensure saved cities persist even after the app is closed or restarted.
* **Validation:** Prevents saving more than 5 cities or duplicate locations.

## 🛠️ Setup & Installation Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nkriznar/mcda5550-reactNative
    cd WeatherApp
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the application:**
    ```bash
    npx expo start
    ```

4.  **Run on Device/Emulator:**
    * **Physical Device:** Download the **Expo Go** app (iOS/Android) and scan the QR code from the terminal.
    * **Android Emulator:** Press `a` in the terminal (requires Android Studio).
    * **iOS Simulator:** Press `i` in the terminal (requires Xcode on macOS).

## 📚 Resources, APIs, and External Libraries

This project uses the following resources and libraries:

* **Open-Meteo API:** Used for fetching weather data and geocoding. No API key is required.
    * *Weather Endpoint:* `https://api.open-meteo.com/v1/forecast`
    * *Geocoding Endpoint:* `https://geocoding-api.open-meteo.com/v1/search`
* **expo-location:** Used to request permissions and retrieve the user's current latitude and longitude.
* **expo-sqlite:** Used to implement the local database for storing favorite cities.
* **React Navigation:** Used for tab-based navigation between screens.

## 🧪 Testing

This app has been tested on the following environments:

* **Physical Device:** [e.g., iPhone 13 (iOS 16) or Samsung Galaxy S21 (Android 13)] *(Please update this with your actual device)*
* **Emulator:** [e.g., Android Studio Pixel 4 API 30]
* **Simulator:** [e.g., iOS Simulator iPhone 14 Pro]

**Verified Functionality:**
* Location permissions prompt correctly on reinstall.
* Saved cities persist after closing and reopening the app.
* The app correctly prevents saving a 6th city (limit of 5).
* Navigation between tabs works smoothly.

## ✅ Assumptions

* **Internet Access:** The app assumes the device has an active internet connection to fetch data from the Open-Meteo API.
* **Location Permissions:** If location permission is denied, the app is designed to fail gracefully (e.g., by showing an error message or defaulting to a specific location like Halifax).
* **Database:** The app assumes a clean install will create a new SQLite database file on the device.

## 👤 Author

* **Name:** Nikola Kriznar
* **Student ID:** [Blank due to public repo]
* **Course:** MCDA5550 - Mobile App Development
