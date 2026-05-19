import React, { useState, useEffect } from 'react';
import { useWeatherStore } from '@/stores/weatherStore';
import './Weather.css';

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export default function Weather() {
  const { weatherData, forecast, cityName, isLoading, fetchWeather, detectLocationAndFetch } = useWeatherStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Spustíme geolokační načtení pokud nemáme ještě načtené počasí
  useEffect(() => {
    if (!weatherData) {
      detectLocationAndFetch();
    }
  }, []);

  // Handler pro vyhledávání měst
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=5&language=cs`
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error('[Weather Search] Geocoding API selhalo.', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCity = async (city: GeocodingResult) => {
    const displayName = `${city.name}, ${city.country}${city.admin1 ? ` (${city.admin1})` : ''}`;
    await fetchWeather(city.latitude, city.longitude, displayName);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getDayName = (dateStr: string) => {
    const days = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
    const date = new Date(dateStr);
    return days[date.getDay()];
  };

  return (
    <div className="weather-app">
      {/* Vyhledávací lišta a detekce polohy */}
      <header className="weather-search-bar">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Vyhledat město... (např. Brno)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="weather-input"
          />
          <button type="submit" className="btn-search">🔍 Hledat</button>
        </form>
        
        <button onClick={detectLocationAndFetch} className="btn-gps" title="Použít GPS polohu">
          📍 Moje poloha
        </button>
      </header>

      {/* Zobrazení výsledků vyhledávání */}
      {searchResults.length > 0 && (
        <div className="search-results-dropdown">
          {searchResults.map(result => (
            <div
              key={result.id}
              onClick={() => handleSelectCity(result)}
              className="search-result-item"
            >
              <strong>{result.name}</strong>, {result.country} {result.admin1 ? `<span className="admin-region">${result.admin1}</span>` : ''}
            </div>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="weather-loading">Načítám aktuální data o počasí...</div>
      ) : weatherData ? (
        <div className="weather-content animate-fade-in">
          {/* Aktuální Počasí */}
          <section className="current-weather-card">
            <div className="current-main">
              <span className="current-emoji">{weatherData.emoji}</span>
              <div className="current-temp-box">
                <span className="current-temp">{weatherData.temp}°C</span>
                <span className="current-desc">{weatherData.description}</span>
                <span className="current-city">📍 {cityName}</span>
              </div>
            </div>

            <div className="weather-details-grid">
              <div className="detail-item">
                <span className="detail-label">Pocitová teplota</span>
                <span className="detail-value">{weatherData.apparentTemp}°C</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Vlhkost vzduchu</span>
                <span className="detail-value">{weatherData.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Rychlost větru</span>
                <span className="detail-value">{weatherData.windSpeed} km/h</span>
              </div>
            </div>
          </section>

          {/* 5-denní předpověď */}
          <section className="forecast-section">
            <h3>Předpověď na 5 dní</h3>
            <div className="forecast-timeline">
              {forecast.map((day, idx) => (
                <div key={idx} className="forecast-card-item">
                  <span className="forecast-day-name">
                    {idx === 0 ? 'Dnes' : getDayName(day.date)}
                  </span>
                  <span className="forecast-date">
                    {new Date(day.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}
                  </span>
                  <span className="forecast-emoji">{day.emoji}</span>
                  <div className="forecast-temps">
                    <span className="temp-max">{day.tempMax}°</span>
                    <span className="temp-min">{day.tempMin}°</span>
                  </div>
                  <span className="forecast-desc" title={day.description}>{day.description}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="weather-error">Zadejte název města pro vyhledání počasí.</div>
      )}
    </div>
  );
}
