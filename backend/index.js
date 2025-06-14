//
// ----------------- SETUP -----------------
//
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

//Place holder function for clothing recommendations
function getClothingRecommendation(temperature) {
    if (temperature > 80) {
        return { men: "Shorts and a t-shirt.", women: "Shorts, skirt, or a summer dress." };
    } else if (temperature > 70) {
        return { men: "Jeans and a t-shirt.", women: "Jeans and a blouse." };
    } else if (temperature > 60) {
        return { men: "Jeans and a long-sleeve shirt.", women: "Pants and a sweater." };
    } else if (temperature > 50) {
        return { men: "Jeans and a light jacket.", women: "Pants and a light jacket." };
    } else {
        return { men: "A warm coat is a good idea.", women: "A warm coat is a good idea." };
    }
}

app.get('/', (req, res) => {
  res.send('Root page. Weather data available at /api/weather');
});

app.get('/api/weather', async (req, res) => {
   try {
    const openMeteoURL = `https://api.open-meteo.com/v1/forecast?latitude=40.0072&longitude=-83.0051&daily=weather_code,sunrise,sunset,temperature_2m_max,temperature_2m_min,uv_index_max,daylight_duration,sunshine_duration,rain_sum,wind_speed_10m_max&hourly=uv_index,uv_index_clear_sky,temperature_2m,relative_humidity_2m,weather_code,pressure_msl,surface_pressure,cloud_cover,precipitation,is_day,precipitation_probability,apparent_temperature&current=temperature_2m,weather_code,precipitation,apparent_temperature,wind_speed_10m,wind_direction_10m,relative_humidity_2m,is_day&timezone=America%2FNew_York&wind_speed_unit=mph&temperature_unit=fahrenheit`;
    
    const response = await axios.get(openMeteoURL);
    const weatherData = response.data;

    // --- NEW LOGIC ---
    // 1. Get the current "feels like" temperature from the data
    const currentFeelsLike = weatherData.current.apparent_temperature;

    // 2. Call our new function with that temperature
    const recommendation = getClothingRecommendation(currentFeelsLike);

    // 3. Create the final response payload
    const responsePayload = {
      ...weatherData, // Copy all the original weather data
      clothing_recommendation: recommendation // Add our new recommendation object
    };
    // --- END OF NEW LOGIC ---
    
    // Send the combined data back to the user
    res.json(responsePayload);

  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).send('Sorry, something went wrong when fetching the weather data.');
  }
});

//
// ----------------- START THE SERVER -----------------
//
app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});