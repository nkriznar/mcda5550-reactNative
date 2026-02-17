import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchWeather, geocodeCity, getWeatherDescription, getWeatherIcon, getWeatherColors } from '@/weatherApi';
import { saveLocation } from '@/database';

interface CityInfo {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
}

interface WeatherData {
    temperature: number;
    windspeed: number;
    weathercode: number;
}

export default function SearchScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [cityInfo, setCityInfo] = useState<CityInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Dynamic colors
    const colors = weather
        ? getWeatherColors(weather.weathercode, isDark)
        : isDark
            ? { bg: '#151718', card: '#1e1e1e', accent: '#0a7ea4', text: '#ecedee', subtext: '#9ba1a6' }
            : { bg: '#f0f4f8', card: '#ffffff', accent: '#0a7ea4', text: '#333', subtext: '#666' };

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setWeather(null);
        setCityInfo(null);
        setError(null);

        try {
            const geo = await geocodeCity(query.trim());

            if (!geo) {
                setError('City not found. Please try a different name.');
                return;
            }

            setCityInfo(geo);
            const data = await fetchWeather(geo.latitude, geo.longitude);
            setWeather(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!cityInfo) return;

        try {
            saveLocation(cityInfo.name, cityInfo.latitude, cityInfo.longitude);
            Alert.alert('Saved', `${cityInfo.name} has been saved!`);
        } catch (err: unknown) {
            if (err instanceof Error && err.message.includes('5')) {
                Alert.alert('Limit Reached', 'Please remove a city first.');
            } else {
                Alert.alert('Error', err instanceof Error ? err.message : 'Unknown error');
            }
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <Text style={[styles.heading, { color: colors.text }]}>Search Weather</Text>

                    <View style={styles.searchRow}>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    backgroundColor: colors.card,
                                    color: colors.text,
                                    borderColor: isDark ? '#333' : '#ddd',
                                },
                            ]}
                            placeholder="Enter city name…"
                            placeholderTextColor={colors.subtext}
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                        <TouchableOpacity
                            style={[styles.searchBtn, { backgroundColor: colors.accent }]}
                            onPress={handleSearch}
                        >
                            <Text style={styles.searchBtnText}>Search</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && (
                        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 24 }} />
                    )}

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    {weather && cityInfo && (
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <Text style={styles.icon}>{getWeatherIcon(weather.weathercode)}</Text>
                            <Text style={[styles.city, { color: colors.text }]}>
                                {cityInfo.name}, {cityInfo.country}
                            </Text>
                            <Text style={[styles.temp, { color: colors.accent }]}>{weather.temperature}°C</Text>
                            <Text style={[styles.description, { color: colors.subtext }]}>
                                {getWeatherDescription(weather.weathercode)}
                            </Text>
                            <Text style={[styles.wind, { color: colors.subtext }]}>
                                💨 {weather.windspeed} km/h
                            </Text>

                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveBtnText}>💾 Save Location</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 16,
    },
    heading: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 16,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        flex: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 1,
    },
    searchBtn: {
        borderRadius: 14,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    searchBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    errorText: {
        color: '#e74c3c',
        marginTop: 16,
        fontSize: 15,
        textAlign: 'center',
    },
    card: {
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    icon: {
        fontSize: 60,
        marginBottom: 8,
    },
    city: {
        fontSize: 22,
        fontWeight: '600',
    },
    temp: {
        fontSize: 46,
        fontWeight: '700',
    },
    description: {
        fontSize: 17,
        marginTop: 4,
    },
    wind: {
        fontSize: 15,
        marginTop: 8,
    },
    saveBtn: {
        marginTop: 22,
        backgroundColor: '#27ae60',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 28,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
