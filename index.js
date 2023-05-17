import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import mongoose from 'mongoose';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3001;
const uri = "mongodb+srv://web-dev:web-dev@weather-app.03nzmks.mongodb.net/?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Failed to connect to MongoDB:', error);
  });

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

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
    });
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
