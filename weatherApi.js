/**
 * Weather API utility using Open-Meteo (no API key required).
 */

// Fetch current weather for given coordinates
export const fetchWeather = async (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json();
    return data.current_weather; // { temperature, windspeed, weathercode, ... }
};

// Geocode a city name to coordinates using Open-Meteo Geocoding API
export const geocodeCity = async (name) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
            name: result.name,
            latitude: result.latitude,
            longitude: result.longitude,
            country: result.country,
        };
    }
    return null;
};

// Map WMO weather codes to human-readable descriptions
export const getWeatherDescription = (code) => {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snowfall',
        73: 'Moderate snowfall',
        75: 'Heavy snowfall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return descriptions[code] || 'Unknown';
};

// Get theme colors based on weather condition and dark/light mode
export const getWeatherColors = (code, isDark = false) => {
    // Clear / Sunny
    if (code === 0) {
        return isDark
            ? { bg: '#1a1a2e', card: '#16213e', accent: '#f5a623', text: '#f0f0f0', subtext: '#aaa' }
            : { bg: '#fff8e1', card: '#ffffff', accent: '#f5a623', text: '#333', subtext: '#666' };
    }
    // Partly cloudy
    if (code <= 3) {
        return isDark
            ? { bg: '#1b2838', card: '#1e3a50', accent: '#64b5f6', text: '#f0f0f0', subtext: '#aaa' }
            : { bg: '#e3f2fd', card: '#ffffff', accent: '#42a5f5', text: '#333', subtext: '#666' };
    }
    // Fog
    if (code <= 48) {
        return isDark
            ? { bg: '#212121', card: '#2c2c2c', accent: '#9e9e9e', text: '#e0e0e0', subtext: '#999' }
            : { bg: '#eceff1', card: '#ffffff', accent: '#78909c', text: '#333', subtext: '#666' };
    }
    // Drizzle / Rain
    if (code <= 67) {
        return isDark
            ? { bg: '#0d1b2a', card: '#1b2a3d', accent: '#4fc3f7', text: '#f0f0f0', subtext: '#aaa' }
            : { bg: '#e1f5fe', card: '#ffffff', accent: '#0288d1', text: '#333', subtext: '#666' };
    }
    // Snow
    if (code <= 77) {
        return isDark
            ? { bg: '#1a1a2e', card: '#252545', accent: '#b3e5fc', text: '#f0f0f0', subtext: '#aaa' }
            : { bg: '#e8eaf6', card: '#ffffff', accent: '#5c6bc0', text: '#333', subtext: '#666' };
    }
    // Rain showers
    if (code <= 86) {
        return isDark
            ? { bg: '#0d1b2a', card: '#1b2a3d', accent: '#4db6ac', text: '#f0f0f0', subtext: '#aaa' }
            : { bg: '#e0f2f1', card: '#ffffff', accent: '#00897b', text: '#333', subtext: '#666' };
    }
    // Thunderstorm
    if (code >= 95) {
        return isDark
            ? { bg: '#1a0a2e', card: '#2d1b4e', accent: '#ce93d8', text: '#f0f0f0', subtext: '#aaa' }
            : { bg: '#f3e5f5', card: '#ffffff', accent: '#8e24aa', text: '#333', subtext: '#666' };
    }
    // Default
    return isDark
        ? { bg: '#151718', card: '#1e1e1e', accent: '#0a7ea4', text: '#ecedee', subtext: '#9ba1a6' }
        : { bg: '#f0f4f8', card: '#ffffff', accent: '#0a7ea4', text: '#333', subtext: '#666' };
};

// Map WMO weather codes to emoji icons
export const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 57) return '🌧️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '❄️';
    if (code <= 82) return '🌦️';
    if (code <= 86) return '🌨️';
    if (code >= 95) return '⛈️';
    return '🌡️';
};
