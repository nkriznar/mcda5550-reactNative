import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchWeather, getWeatherDescription, getWeatherIcon, getWeatherColors } from '@/weatherApi';

interface WeatherData {
    temperature: number;
    windspeed: number;
    weathercode: number;
    winddirection: number;
    is_day: number;
    time: string;
}

export default function CityDetailScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { name, latitude, longitude } = useLocalSearchParams<{
        name: string;
        latitude: string;
        longitude: string;
    }>();

    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const lat = parseFloat(latitude as string);
                const lon = parseFloat(longitude as string);
                const data = await fetchWeather(lat, lon);
                setWeather(data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load weather');
            } finally {
                setLoading(false);
            }
        })();
    }, [latitude, longitude]);

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
                <Text style={[styles.loadingText, { color: colors.subtext }]}>Loading weather…</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.centered, { backgroundColor: colors.bg }]}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {weather && (
                    <>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <Text style={styles.icon}>{getWeatherIcon(weather.weathercode)}</Text>
                            <Text style={[styles.city, { color: colors.text }]}>{name}</Text>
                            <Text style={[styles.temp, { color: colors.accent }]}>{weather.temperature}°C</Text>
                            <Text style={[styles.description, { color: colors.subtext }]}>
                                {getWeatherDescription(weather.weathercode)}
                            </Text>
                        </View>

                        <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.subtext }]}>💨 Wind Speed</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{weather.windspeed} km/h</Text>
                            </View>
                            <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#eee' }]} />
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.subtext }]}>🧭 Wind Direction</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{weather.winddirection}°</Text>
                            </View>
                            <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#eee' }]} />
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.subtext }]}>{weather.is_day ? '☀️' : '🌙'} Time of Day</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{weather.is_day ? 'Daytime' : 'Nighttime'}</Text>
                            </View>
                            <View style={[styles.separator, { backgroundColor: isDark ? '#333' : '#eee' }]} />
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.subtext }]}>🕐 Last Updated</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>
                                    {new Date(weather.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
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
        alignItems: 'center',
        padding: 20,
        paddingTop: 10,
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
    card: {
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        width: '100%',
        marginBottom: 16,
    },
    icon: {
        fontSize: 72,
        marginBottom: 8,
    },
    city: {
        fontSize: 26,
        fontWeight: '600',
        marginBottom: 4,
    },
    temp: {
        fontSize: 54,
        fontWeight: '700',
    },
    description: {
        fontSize: 18,
        marginTop: 4,
    },
    detailsCard: {
        borderRadius: 20,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    detailLabel: {
        fontSize: 16,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    separator: {
        height: 1,
    },
});
