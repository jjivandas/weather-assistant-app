import { StyleSheet, Text, View, ScrollView, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';

// --- TYPE DEFINITIONS ---
// This is the blueprint for all the data we're using
type WeatherData = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    weather_code: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
  daily: {
    uv_index_max: number[];
  };
  clothing_recommendation: {
    men: string;
  };
};

// --- HELPER FUNCTIONS ---
function getWeatherInterpretation(code: number) {
  if (code === 0) return "Clear Sky";
  if (code >= 1 && code <= 3) return "Partly Cloudy";
  if (code >= 51 && code <= 67) return "Rain";
  // Add other codes as needed
  return "Unknown";
}

function getUvInterpretation(uvIndex: number) {
  if (uvIndex <= 2) return "Low";
  if (uvIndex <= 5) return "Moderate";
  if (uvIndex <= 7) return "High";
  return "Very High";
}

export default function HomeScreen() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  // State for our live clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Effect for fetching weather data (runs once)
  useEffect(() => {
    const API_URL = 'http://localhost:3000/api/weather';
    axios.get(API_URL).then(response => {
      setWeatherData(response.data);
    }).catch(error => {
      console.error("Error fetching data: ", error);
    });
  }, []);

  // Effect for the clock timer (sets up once)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000 * 60); // Update every minute

    return () => clearInterval(timer); // Cleanup timer
  }, []);

  if (!weatherData) {
    return <View style={styles.container}><Text>Loading weather...</Text></View>;
  }

  // --- Data Preparation ---
  const now = new Date();
  const currentTemp = Math.round(weatherData.current.temperature_2m);
  const feelsLikeTemp = Math.round(weatherData.current.apparent_temperature);
  const weatherDescription = getWeatherInterpretation(weatherData.current.weather_code);
  const maxUvIndex = weatherData.daily.uv_index_max[0];
  
  // Updated hourly data logic with filtering
  const hourlyFormatted = weatherData.hourly.time
    .map((time, index) => ({
      id: time,
      isoTime: time,
      displayTime: new Date(time).toLocaleTimeString([], { hour: 'numeric', hour12: true }),
      temp: Math.round(weatherData.hourly.temperature_2m[index]),
    }))
    .filter(item => new Date(item.isoTime) > now) // Filter out past hours
    .slice(0, 24);

  return (
    <ScrollView style={styles.outerContainer}>
      <View style={styles.container}>
        
        {/* All the UI code is here, in one place */}
        <Text style={styles.locationText}>Columbus, OH</Text>
        <Text style={styles.timeText}>
          As of {currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </Text>
        <Text style={styles.tempText}>{currentTemp}° F</Text>
        <Text style={styles.descriptionText}>{weatherDescription}</Text>
        <Text style={styles.feelsLikeText}>Feels like: {feelsLikeTemp}°</Text>

        <View style={styles.hourlyContainer}>
          <FlatList
            data={hourlyFormatted}
            renderItem={({ item }) => (
              <View style={styles.hourItem}>
                <Text style={styles.hourText}>{item.displayTime}</Text>
                <Text style={styles.hourTemp}>{item.temp}°</Text>
              </View>
            )}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>UV INDEX</Text>
            <Text style={styles.cardValue}>{maxUvIndex}</Text>
            <Text style={styles.cardDescription}>{getUvInterpretation(maxUvIndex)}</Text>
          </View>
          <View style={styles.detailCard}>
            <Text style={styles.cardTitle}>WHAT TO WEAR</Text>
            <Text style={styles.cardValue}>👕</Text>
            <Text style={styles.cardDescription}>{weatherData.clothing_recommendation.men}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// All styles are here in one file
const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#87CEEB' },
  container: { flex: 1, alignItems: 'center', paddingTop: 80, paddingBottom: 40 },
  locationText: { fontSize: 24, color: 'white' },
  timeText: { fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 },
  tempText: { fontSize: 72, fontWeight: 'bold', color: 'white', marginTop: 4 },
  descriptionText: { fontSize: 28, fontStyle: 'italic', color: 'white' },
  feelsLikeText: { fontSize: 18, color: 'white', marginBottom: 20 },
  hourlyContainer: { width: '100%', paddingVertical: 15, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  hourItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  hourText: { color: 'white', fontSize: 16 },
  hourTemp: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  gridContainer: { width: '90%', marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  detailCard: { width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 15, padding: 15, alignItems: 'center', marginBottom: 15 },
  cardTitle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  cardValue: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  cardDescription: { color: 'white', fontSize: 14, textAlign: 'center', marginTop: 10 },
});