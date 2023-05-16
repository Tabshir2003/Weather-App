import React, { useState } from "react";
import "./App.css"; // Import the App.css file

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
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
          throw new Error("Failed to fetch weather data.");
        }
        return response.json();
      })
      .then((data) => {
        const temperatureInKelvin = data.main.temp;
        const temperatureInFahrenheit = convertKelvinToFahrenheit(temperatureInKelvin).toFixed(2);
        setWeatherData({
          temperature: temperatureInFahrenheit,
          windSpeed: data.wind.speed,
          humidity: data.main.humidity,
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        setError(error.message);
      });
  }

  return (
    <div className="App">
      <form className="search-form" onSubmit={handleSubmit}>
        <label>
          Enter a city:
          <input type="text" value={city} onChange={handleCityChange} />
        </label>
        <button type="submit" disabled={!city || isLoading}>
          {isLoading ? "Loading..." : "Search"}
        </button>
      </form>
      {error && <p>{error}</p>}
      {weatherData && (
        <div>
          <div id="temperature">Temperature: {weatherData.temperature}°F</div>
          <div id="wind-speed">Wind Speed: {weatherData.windSpeed}</div>
          <div id="humidity">Humidity: {weatherData.humidity}</div>
        </div>
      )}
    </div>
  );
}

export default App;