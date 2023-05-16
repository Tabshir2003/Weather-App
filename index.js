import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import mongoose from 'mongoose'; 
const app = express();
app.use(express.static('public'));
app.use(cors());

const uri = "mongodb+srv://web-dev:X5zV8TlnsIvOSH4C@weather-app.03nzmks.mongodb.net/?retryWrites=true&w=majority";
async function connect(){
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    // Define the weather data schema
    const weatherSchema = new mongoose.Schema({
      city: { type: String, required: true },
      temperature: { type: Number, required: true },
      humidity: { type: Number, required: true },
      timestamp: { type: Date, default: Date.now }
    });

    // Create the Weather model
    const Weather = mongoose.model('Weather', weatherSchema);

    // Array of cities
    const cities = ['New York', 'London', 'Tokyo']; // Add more cities as needed

    // Fetch weather data for each city
    const apiKey = '406a3468740e62be7410c1adc2da1810'; // Replace with your OpenWeatherMap API key

    const promises = cities.map(city =>
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(weatherData => {
          const temperature = weatherData.main.temp;
          const humidity = weatherData.main.humidity;

          // Save weather data to MongoDB
          const newWeatherData = new Weather({
            city: city,
            temperature: temperature,
            humidity: humidity
          });

          return newWeatherData.save();
        })
        .then(() => {
          console.log(`Weather data saved for ${city}`);
        })
        .catch(error => {
          console.error(`Error saving weather data for ${city}:`, error);
        })
    );

    await Promise.all(promises);
    console.log('All weather data saved to MongoDB');
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

connect(); 

// This allows us to parse JSON data from the request body (if any).
app.use(express.json());
const PORT = 3001;

// This is your root route. Just to used to ensure your ExpressJS server is up and running.
app.get('/', (req, res) => {
  fetch('https://api.thecatapi.com/v1/images/search')
    // This takes the raw response from the fetch promise and parses it to JSON data format.
    .then(response => response.json())
    // And then takes THAT promise and does things with the JSON data.
    .then(data => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                background-color: #71acef;
                font-family: Arial, sans-serif;
              }
              h1 {
                color: #10355f;
              }
            </style>
          </head>
          <body>
            <h1>WeatherApp Ready To Go!</h1>
            <img src='${data[0].url}'>
          </body>
        </html>
      `);
    })
});

// GET Request to get all the JSON data retrieved by city name for CURRENT WEATHER.
app.get('/current-weather/:city', (req, res) => {
  const { city } = req.params;
  const apiKey = '406a3468740e62be7410c1adc2da1810';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(error => {
      console.log(error);
      res.status(500).send('Error retrieving weather data');
    });
});

app.get('/five-weather/:city', async (req, res) => {
  const city = req.params.city;
  const apiKey = '406a3468740e62be7410c1adc2da1810';

  try {
    // Step 1: Search for the city and retrieve latitude and longitude
    const geocodingUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const geocodingResponse = await fetch(geocodingUrl);
    const geocodingData = await geocodingResponse.json();

    if (geocodingData.length === 0) {
      return res.status(404).json({ message: 'City not found' });
    }

    const { lat, lon } = geocodingData[0];

    // Step 2: Get the 5-day weather forecast
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    const weatherForecast = forecastData;
    // Process the weather forecast data as needed

    res.json(weatherForecast);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.listen(PORT, () => {
  console.log(`ExpressJS server listening on port ${PORT}`);
});
