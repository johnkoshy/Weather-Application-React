import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const weatherVideos = {
    Clear: "/videos/clear.mp4",
    Rain: "/videos/rain.mp4",
    Clouds: "/videos/clouds.mp4",
    Snow: "/videos/snow.mp4",
    Thunderstorm: "/videos/thunderstorm.mp4",
    Drizzle: "/videos/drizzle.mp4",
    Default: "/videos/default1.mp4",
    Haze: "/videos/drizzle.mp4",
  };

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=8899465d3193e9d2936bf752c2e263f7`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=8899465d3193e9d2936bf752c2e263f7`;

  const searchLocation = (event) => {
    if (event.key === "Enter") {
      if (!location.trim()) {
        setError("Please enter a valid location.");
        setData({});
        setForecast([]);
        return;
      }
      axios
        .get(url)
        .then((response) => {
          setData(response.data);
          setError("");

          axios
            .get(forecastUrl)
            .then((forecastResponse) => {
              const list = forecastResponse.data.list;
              const uniqueDates = new Map();

              list.forEach((item) => {
                const date = new Date(item.dt * 1000)
                  .toISOString()
                  .split("T")[0];
                if (!uniqueDates.has(date)) {
                  uniqueDates.set(date, item);
                }
              });
              setForecast(Array.from(uniqueDates.values()).slice(0, 5));
            })
            .catch(() => {
              setError("Failed to fetch forecast data. Please try again.");
              setForecast([]);
            });
        })
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            setError("Location not found. Please try again.");
          } else {
            setError("An error occurred. Please try again.");
          }
          setData({});
          setForecast([]);
        });
      setLocation("");
    }
  };

  const getWeatherVideo = () => {
    if (data.weather && data.weather[0]) {
      const condition = data.weather[0].main;
      return weatherVideos[condition] || weatherVideos["Default"];
    }
    return weatherVideos["Default"];
  };
  console.log('conditon new:', getWeatherVideo())


  return (
    <div className="app">
      {/* Background video */}
      <video key={getWeatherVideo()} autoPlay loop muted className="background-video">
        <source src={getWeatherVideo()} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Search bar */}
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyDown={searchLocation}
          placeholder="Enter Location"
          type="text"
        />
        <div>{error && <p className="error">{error}</p>}</div>
      </div>

      {/* Weather details */}
      <div className="container">
        <div className="top">
          <div className="icon">
            {data.weather ? (
              <img
                src={`http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`}
                alt="Weather Icon"
              />
            ) : null}
          </div>
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed()}&deg;C</h1> : null}
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        {data.name !== undefined && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">{data.main.feels_like}&deg;C</p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? (
                <p className="bold">{data.main.humidity}&deg;C</p>
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

      {/* Forecast */}
      <div className="forecast">
        {forecast.map((item, index) => (
          <div key={index} className="forecast-item">
            <p>{new Date(item.dt * 1000).toLocaleDateString()}</p>
            <p>{item.main.temp.toFixed()}°C</p>
            <img
              src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
              alt="Weather Icon"
            />
            <p>{item.weather[0].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
