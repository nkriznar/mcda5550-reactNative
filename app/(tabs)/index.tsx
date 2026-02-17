import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { fetchWeather, getWeatherDescription, getWeatherIcon } from '@/weatherApi';

// Default fallback: Halifax, NS
const DEFAULT_CITY = 'Halifax';
const DEFAULT_LAT = 44.6488;
const DEFAULT_LON = -63.5752;

export default function CurrentWeatherScreen() {
  const [weather, setWeather] = useState(null);
  const [cityLabel, setCityLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        let lat, lon, label;

        if (status === 'granted') {
          const position = await Location.getCurrentPositionAsync({});
          lat = position.coords.latitude;
          lon = position.coords.longitude;

          // Reverse-geocode to get a city name
          const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
          label = place?.city || place?.region || 'Your Location';
        } else {
          // Permission denied – fall back to Halifax
          lat = DEFAULT_LAT;
          lon = DEFAULT_LON;
          label = `${DEFAULT_CITY} (default)`;
        }

        setCityLabel(label);
        const data = await fetchWeather(lat, lon);
        setWeather(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Fetching weather…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>{getWeatherIcon(weather.weathercode)}</Text>
        <Text style={styles.city}>{cityLabel}</Text>
        <Text style={styles.temp}>{weather.temperature}°C</Text>
        <Text style={styles.description}>
          {getWeatherDescription(weather.weathercode)}
        </Text>
        <Text style={styles.wind}>Wind: {weather.windspeed} km/h</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: '85%',
  },
  icon: {
    fontSize: 64,
    marginBottom: 8,
  },
  city: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  temp: {
    fontSize: 48,
    fontWeight: '700',
    color: '#0a7ea4',
  },
  description: {
    fontSize: 18,
    color: '#666',
    marginTop: 4,
  },
  wind: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
  },
});
