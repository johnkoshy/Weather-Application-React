import React, { useState } from "react";
import axios from "axios";
import "./App.css";

// Main App component for the weather application
function App() {
  // State to store current weather data
  const [data, setData] = useState({});
  // State to store user-entered location
  const [location, setLocation] = useState("");
  // State to store 5-day weather forecast data
  const [forecast, setForecast] = useState([]);
  // State to store error messages for user feedback
  const [error, setError] = useState("");

  // Object mapping weather conditions to background video paths
  const weatherVideos = {
    Clear: "/videos/clear.mp4",
    Rain: "/videos/rain.mp4",
    Clouds: "/videos/clouds.mp4",
    Snow: "/videos/snow.mp4",
    Thunderstorm: "/videos/thunderstorm.mp4",
    Drizzle: "/videos/drizzle.mp4",
    Default: "/videos/default.mp4",
    Haze: "/videos/drizzle.mp4",
  };

  // API URLs for current weather and 5-day forecast using OpenWeatherMap
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=8899465d3193e9d2936bf752c2e263f7`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=8899465d3193e9d2936bf752c2e263f7`;

  // Function to handle location search when user presses Enter
  const searchLocation = (event) => {
    if (event.key === "Enter") {
      // Validate location input
      if (!location.trim()) {
        setError("Please enter a valid location.");
        setData({});
        setForecast([]);
        return;
      }
      // Fetch current weather data
      axios
        .get(url)
        .then((response) => {
          setData(response.data);
          setError("");

          // Fetch 5-day forecast data
          axios
            .get(forecastUrl)
            .then((forecastResponse) => {
              const list = forecastResponse.data.list;
              const uniqueDates = new Map();

              // Filter forecast to one entry per day
              list.forEach((item) => {
                const date = new Date(item.dt * 1000)
                  .toISOString()
                  .split("T")[0];
                if (!uniqueDates.has(date)) {
                  uniqueDates.set(date, item);
                }
              });
              // Store up to 5 days of forecast data
              setForecast(Array.from(uniqueDates.values()).slice(0, 5));
            })
            .catch(() => {
              setError("Failed to fetch forecast data. Please try again.");
              setForecast([]);
            });
        })
        .catch((error) => {
          // Handle API errors (e.g., invalid location)
          if (error.response && error.response.status === 404) {
            setError("Location not found. Please try again.");
          } else {
            setError("An error occurred. Please try again.");
          }
          setData({});
          setForecast([]);
        });
      // Clear input field after search
      setLocation("");
    }
  };

  // Function to determine the background video based on current weather
  const getWeatherVideo = () => {
    if (data.weather && data.weather[0]) {
      const condition = data.weather[0].main;
      return weatherVideos[condition] || weatherVideos["Default"];
    }
    return weatherVideos["Default"];
  };
  // Log current weather video for debugging
  console.log('conditon new:', getWeatherVideo());

  // Render the application UI
  return (
    <div className="app">
      {/* Background video based on weather condition */}
      <video key={getWeatherVideo()} autoPlay loop muted className="background-video">
        <source src={getWeatherVideo()} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Search bar for location input */}
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyDown={searchLocation}
          placeholder="Enter Location"
          type="text"
          autoFocus // Automatically focus the input on page load
        />
        <div>{error && <p className="error">{error}</p>}</div>
      </div>

      {/* Current weather details */}
      <div className="container">
        <div className="top">
          {/* Weather icon */}
          <div className="icon">
            {data.weather ? (
              <img
                src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                alt="Weather Icon"
              />
            ) : null}
          </div>
          {/* Location name */}
          <div className="location">
            <p>{data.name}</p>
          </div>
          {/* Current temperature */}
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed()}°C</h1> : null}
          </div>
          {/* Weather description */}
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        {/* Additional weather details (feels like, humidity, wind) */}
        {data.name !== undefined && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">{data.main.feels_like}°C</p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? (
                <p className="bold">{data.main.humidity}°C</p>
              ) : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.main ? (
                <p className="bold">{data.wind.speed} MPH</p>
              ) : null}
              <p>Wind Speed</p>
            </div>
          </div>
        )}
      </div>

      {/* 5-day weather forecast */}
      <div className="forecast">
        {forecast.map((item, index) => (
          <div key={index} className="forecast-item">
            {/* Forecast date */}
            <p>{new Date(item.dt * 1000).toLocaleDateString()}</p>
            {/* Forecast temperature */}
            <p>{item.main.temp.toFixed()}°C</p>
            {/* Forecast weather icon */}
            <img
              src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
              alt="Weather Icon"
            />
            {/* Forecast description */}
            <p>{item.weather[0].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export the App component
export default App;