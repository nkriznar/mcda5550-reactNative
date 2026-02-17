import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getSavedLocations, removeLocation } from '@/database';
import { fetchWeather, getWeatherIcon, getWeatherColors } from '@/weatherApi';

interface SavedLocation {
    id: number;
    cityName: string;
    latitude: number;
    longitude: number;
    weather?: {
        temperature: number;
        windspeed: number;
        weathercode: number;
    } | null;
}

export default function SavedScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();

    const colors = isDark
        ? { bg: '#151718', card: '#1e1e1e', text: '#ecedee', subtext: '#9ba1a6', accent: '#0a7ea4' }
        : { bg: '#f0f4f8', card: '#ffffff', text: '#333', subtext: '#666', accent: '#0a7ea4' };

    const [locations, setLocations] = useState<SavedLocation[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLocations = useCallback(async () => {
        setLoading(true);
        try {
            const saved = getSavedLocations();

            // Fetch weather for all saved locations in parallel
            const withWeather: SavedLocation[] = await Promise.all(
                saved.map(async (loc: SavedLocation) => {
                    try {
                        const weather = await fetchWeather(loc.latitude, loc.longitude);
                        return { ...loc, weather };
                    } catch {
                        return { ...loc, weather: null };
                    }
                })
            );

            setLocations(withWeather);
        } catch (err) {
            console.error('Failed to load saved locations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Reload every time the tab is focused
    useFocusEffect(
        useCallback(() => {
            loadLocations();
        }, [loadLocations])
    );

    const handleDelete = (id: number) => {
        removeLocation(id);
        loadLocations();
    };

    const openCityDetail = (item: SavedLocation) => {
        router.push({
            pathname: '/city-detail',
            params: {
                name: item.cityName,
                latitude: item.latitude.toString(),
                longitude: item.longitude.toString(),
            },
        });
    };

    const renderItem = ({ item }: { item: SavedLocation }) => {
        // Get per-city accent color matching the detail modal
        const itemColors = item.weather
            ? getWeatherColors(item.weather.weathercode, isDark)
            : colors;

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => openCityDetail(item)}
                style={[styles.card, { backgroundColor: colors.card }]}
            >
                <View style={styles.cardContent}>
                    <Text style={[styles.cityName, { color: colors.text }]}>{item.cityName}</Text>
                    {item.weather ? (
                        <View style={styles.weatherRow}>
                            <Text style={styles.weatherIcon}>
                                {getWeatherIcon(item.weather.weathercode)}
                            </Text>
                            <Text style={[styles.temp, { color: itemColors.accent }]}>
                                {item.weather.temperature}°C
                            </Text>
                            <Text style={[styles.wind, { color: colors.subtext }]}>
                                💨 {item.weather.windspeed} km/h
                            </Text>
                        </View>
                    ) : (
                        <Text style={[styles.noWeather, { color: colors.subtext }]}>Weather unavailable</Text>
                    )}
                    <Text style={[styles.tapHint, { color: colors.subtext }]}>Tap for details →</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.centered, { backgroundColor: colors.bg }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            <Text style={[styles.heading, { color: colors.text }]}>Saved Locations</Text>
            <Text style={[styles.subtitle, { color: colors.subtext }]}>
                {locations.length} / 5 cities saved
            </Text>

            {locations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📍</Text>
                    <Text style={[styles.emptyText, { color: colors.subtext }]}>
                        No saved locations yet.{'\n'}Use the Search tab to add cities.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={locations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
        paddingHorizontal: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    cardContent: {
        flex: 1,
    },
    cityName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    weatherIcon: {
        fontSize: 22,
    },
    temp: {
        fontSize: 16,
        fontWeight: '600',
    },
    wind: {
        fontSize: 14,
    },
    noWeather: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    tapHint: {
        fontSize: 12,
        marginTop: 6,
        fontStyle: 'italic',
    },
    deleteBtn: {
        backgroundColor: '#e74c3c',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginLeft: 12,
    },
    deleteBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
