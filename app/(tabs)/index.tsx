import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as Location from 'expo-location';
import { fetchWeather, getWeatherDescription, getWeatherIcon, getWeatherColors } from '@/weatherApi';
import { saveLocation, getSavedLocations, removeLocation } from '@/database';

// Default fallback: Halifax, NS
const DEFAULT_CITY = 'Halifax';
const DEFAULT_LAT = 44.6488;
const DEFAULT_LON = -63.5752;

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

interface SavedEntry {
  id: number;
  cityName: string;
  latitude: number;
  longitude: number;
}

export default function CurrentWeatherScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [cityLabel, setCityLabel] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null); // null = not saved

  const checkIfSaved = useCallback((label: string) => {
    const saved = getSavedLocations() as SavedEntry[];
    const match = saved.find((s) => s.cityName === label);
    setSavedId(match ? match.id : null);
  }, []);

  const loadWeather = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      let lat: number, lon: number, label: string;

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
      setCoords({ lat, lon });
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setError(null);
      checkIfSaved(label);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [checkIfSaved]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadWeather();
  }, [loadWeather]);

  const handleSave = () => {
    if (!coords || !cityLabel) return;
    try {
      saveLocation(cityLabel, coords.lat, coords.lon);
      Alert.alert('Saved', `${cityLabel} has been saved!`);
      checkIfSaved(cityLabel);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('5')) {
        Alert.alert('Limit Reached', 'Please remove a city first.');
      } else {
        Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
      }
    }
  };

  const handleRemove = () => {
    if (savedId === null) return;
    removeLocation(savedId);
    setSavedId(null);
    Alert.alert('Removed', `${cityLabel} has been removed from saved.`);
  };

  const openDetail = () => {
    if (!coords || !cityLabel) return;
    router.push({
      pathname: '/city-detail',
      params: {
        name: cityLabel,
        latitude: coords.lat.toString(),
        longitude: coords.lon.toString(),
      },
    });
  };

  // Dynamic colors based on weather
  const colors = weather
    ? getWeatherColors(weather.weathercode, isDark)
    : isDark
      ? { bg: '#151718', card: '#1e1e1e', accent: '#0a7ea4', text: '#ecedee', subtext: '#9ba1a6' }
      : { bg: '#f0f4f8', card: '#ffffff', accent: '#0a7ea4', text: '#333', subtext: '#666' };

  if (loading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.subtext }]}>Fetching weather…</Text>
      </SafeAreaView>
    );
  }

  if (error && !weather) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.bg }]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        <Text style={[styles.header, { color: colors.text }]}>Current Weather</Text>
        {weather && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={openDetail}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={styles.icon}>{getWeatherIcon(weather.weathercode)}</Text>
            <Text style={[styles.city, { color: colors.text }]}>{cityLabel}</Text>
            <Text style={[styles.temp, { color: colors.accent }]}>{weather.temperature}°C</Text>
            <Text style={[styles.description, { color: colors.subtext }]}>
              {getWeatherDescription(weather.weathercode)}
            </Text>
            <Text style={[styles.wind, { color: colors.subtext }]}>
              💨 {weather.windspeed} km/h
            </Text>
            <Text style={[styles.tapHint, { color: colors.subtext }]}>Tap for details →</Text>
          </TouchableOpacity>
        )}

        {/* Save / Remove button */}
        {weather && coords && (
          savedId !== null ? (
            <TouchableOpacity
              style={[styles.actionBtn, styles.removeBtn]}
              onPress={handleRemove}
            >
              <Text style={styles.actionBtnText}>🗑️ Remove from Saved</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn]}
              onPress={handleSave}
            >
              <Text style={styles.actionBtnText}>💾 Save Location</Text>
            </TouchableOpacity>
          )
        )}

        <Text style={[styles.hint, { color: colors.subtext }]}>Pull down to refresh</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    width: '90%',
  },
  icon: {
    fontSize: 72,
    marginBottom: 8,
  },
  city: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  temp: {
    fontSize: 52,
    fontWeight: '700',
  },
  description: {
    fontSize: 18,
    marginTop: 4,
  },
  wind: {
    fontSize: 16,
    marginTop: 10,
  },
  tapHint: {
    marginTop: 14,
    fontSize: 13,
    fontStyle: 'italic',
  },
  actionBtn: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    width: '90%',
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#27ae60',
  },
  removeBtn: {
    backgroundColor: '#e74c3c',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  hint: {
    marginTop: 16,
    fontSize: 13,
    fontStyle: 'italic',
  },
});
