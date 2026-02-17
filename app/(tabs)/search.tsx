import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { fetchWeather, geocodeCity, getWeatherDescription, getWeatherIcon } from '@/weatherApi';
import { saveLocation } from '@/database';

export default function SearchScreen() {
    const [query, setQuery] = useState('');
    const [weather, setWeather] = useState(null);
    const [cityInfo, setCityInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (!cityInfo) return;

        try {
            saveLocation(cityInfo.name, cityInfo.latitude, cityInfo.longitude);
            Alert.alert('Saved', `${cityInfo.name} has been saved!`);
        } catch (err) {
            if (err.message.includes('5')) {
                Alert.alert('Limit Reached', 'Please remove a city first.');
            } else {
                Alert.alert('Error', err.message);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                <Text style={styles.heading}>Search Weather</Text>

                <View style={styles.searchRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter city name…"
                        placeholderTextColor="#999"
                        value={query}
                        onChangeText={setQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
                        <Text style={styles.searchBtnText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {loading && (
                    <ActivityIndicator size="large" color="#0a7ea4" style={{ marginTop: 24 }} />
                )}

                {error && <Text style={styles.errorText}>{error}</Text>}

                {weather && cityInfo && (
                    <View style={styles.card}>
                        <Text style={styles.icon}>{getWeatherIcon(weather.weathercode)}</Text>
                        <Text style={styles.city}>
                            {cityInfo.name}, {cityInfo.country}
                        </Text>
                        <Text style={styles.temp}>{weather.temperature}°C</Text>
                        <Text style={styles.description}>
                            {getWeatherDescription(weather.weathercode)}
                        </Text>
                        <Text style={styles.wind}>Wind: {weather.windspeed} km/h</Text>

                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Save Location</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    inner: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    heading: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 16,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchBtn: {
        backgroundColor: '#0a7ea4',
        borderRadius: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    searchBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginTop: 16,
        fontSize: 15,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    icon: {
        fontSize: 56,
        marginBottom: 8,
    },
    city: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333',
    },
    temp: {
        fontSize: 44,
        fontWeight: '700',
        color: '#0a7ea4',
    },
    description: {
        fontSize: 17,
        color: '#666',
        marginTop: 4,
    },
    wind: {
        fontSize: 15,
        color: '#888',
        marginTop: 6,
    },
    saveBtn: {
        marginTop: 20,
        backgroundColor: '#27ae60',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 28,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
