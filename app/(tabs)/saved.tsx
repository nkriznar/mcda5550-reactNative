import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getSavedLocations, removeLocation } from '@/database';
import { fetchWeather, getWeatherIcon } from '@/weatherApi';

export default function SavedScreen() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadLocations = useCallback(async () => {
        setLoading(true);
        try {
            const saved = getSavedLocations();

            // Fetch weather for all saved locations in parallel
            const withWeather = await Promise.all(
                saved.map(async (loc) => {
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

    const handleDelete = (id) => {
        removeLocation(id);
        loadLocations();
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.cityName}>{item.cityName}</Text>
                {item.weather ? (
                    <View style={styles.weatherRow}>
                        <Text style={styles.weatherIcon}>
                            {getWeatherIcon(item.weather.weathercode)}
                        </Text>
                        <Text style={styles.temp}>{item.weather.temperature}°C</Text>
                        <Text style={styles.wind}>{item.weather.windspeed} km/h</Text>
                    </View>
                ) : (
                    <Text style={styles.noWeather}>Weather unavailable</Text>
                )}
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.centered}>
                <ActivityIndicator size="large" color="#0a7ea4" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Saved Locations</Text>

            {locations.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>
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
        backgroundColor: '#f0f4f8',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
    },
    heading: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        lineHeight: 24,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        flex: 1,
    },
    cityName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
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
        color: '#0a7ea4',
    },
    wind: {
        fontSize: 14,
        color: '#888',
    },
    noWeather: {
        fontSize: 14,
        color: '#aaa',
        fontStyle: 'italic',
    },
    deleteBtn: {
        backgroundColor: '#e74c3c',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginLeft: 12,
    },
    deleteBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
