import React, { useState } from "react";
// import { MongoClient } from "mongodb";
import "./App.css"; // Import the App.css file


function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleCityChange(event) {
    setCity(event.target.value);
  }

  function convertKelvinToFahrenheit(kelvin) {
    return ((kelvin - 273.15) * 9) / 5 + 32;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
  
    fetch(`http://localhost:3001/current-weather/${city}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch weather data. API potentailly DOWN!"); // Set specific error message
        }
        return response.json();
      })
      .then((data) => {
        if (!data.main || !data.main.temp || !data.wind || !data.wind.speed) {
          throw new Error("Failed to fetch weather data. City is possibly INVALID!"); // Check for required properties
        }
  
        const temperatureInKelvin = data.main.temp;
        const temperatureInFahrenheit = convertKelvinToFahrenheit(temperatureInKelvin).toFixed(2);
        setWeatherData({
          temperature: temperatureInFahrenheit,
          windSpeed: data.wind.speed,
          humidity: data.main.humidity,
        });
      })
      .catch((error) => {
        console.log(error);
        setError(error.message);
      });
  
    fetch(`http://localhost:3001/five-weather/${city}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch forecast data. API potentailly DOWN!");
        }
        return response.json();
      })
      .then((data) => {
        const filteredForecastData = data.list.filter((forecast) => forecast.dt_txt.includes("12:00:00"));
        setForecastData(filteredForecastData);
      })
      .catch((error) => {
        console.log(error);
        setError(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  
  

  return (

    <div className="App">
      <div className="weather-app-heading">Weather App</div>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="prompt">
          Enter a city:
          <input type="text" value={city} onChange={handleCityChange} />
          <button type="submit" disabled={!city || isLoading}>
            {isLoading ? "Loading..." : "Search"}
          </button>
        </div>
      </form>
      {error && <p className="error-message">{error}</p>}
      {weatherData && (
        <div className="current-weather">
          <div id="temperature">Temperature: {weatherData.temperature}°F</div>
          <div id="wind-speed">Wind Speed: {weatherData.windSpeed}</div>
          <div id="humidity">Humidity: {weatherData.humidity}</div>
        </div>
      )}
      {forecastData.length > 0 && (
        <div>
          <div className="wrapper">
          <div className="forecast-container">
          <div className= 'five-day-header'>5-Day Weather Forecast</div>
          <div className="five-day">
            {forecastData.map((forecast) => (
              <div key={forecast.dt}>
                <div>Date: {forecast.dt_txt.slice(0, 10)}</div>
                <div>Temperature: {convertKelvinToFahrenheit(forecast.main.temp).toFixed(2)}°F</div>
              </div>
            ))}
          </div>
        </div>
        </div>
        </div>
      )}
    </div>
  );
}

export default App