import { create } from 'zustand';

export interface WeatherData {
  temp: number;
  apparentTemp: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
  emoji: string;
}

export interface ForecastDay {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  description: string;
  emoji: string;
}

interface WeatherState {
  weatherData: WeatherData | null;
  forecast: ForecastDay[];
  isLoading: boolean;
  cityName: string;
  latitude: number;
  longitude: number;
  fetchWeather: (lat: number, lon: number, cityName?: string) => Promise<void>;
  detectLocationAndFetch: () => Promise<void>;
}

// WMO kód k popisu a emoji mapování v češtině
export function mapWMOCode(code: number): { description: string; emoji: string } {
  switch (code) {
    case 0:
      return { description: 'Jasno', emoji: '☀️' };
    case 1:
      return { description: 'Převážně jasno', emoji: '🌤' };
    case 2:
      return { description: 'Polojasno', emoji: '⛅' };
    case 3:
      return { description: 'Zataženo', emoji: '☁️' };
    case 45:
    case 48:
      return { description: 'Mlha', emoji: '🌫' };
    case 51:
    case 53:
    case 55:
      return { description: 'Mrholení', emoji: '🌦' };
    case 56:
    case 57:
      return { description: 'Mrznoucí mrholení', emoji: '🌧' };
    case 61:
      return { description: 'Slabý déšť', emoji: '🌧' };
    case 63:
      return { description: 'Mírný déšť', emoji: '🌧' };
    case 65:
      return { description: 'Silný déšť', emoji: '🌧' };
    case 66:
    case 67:
      return { description: 'Mrznoucí déšť', emoji: '🌧' };
    case 71:
      return { description: 'Slabé sněžení', emoji: '❄️' };
    case 73:
      return { description: 'Mírné sněžení', emoji: '❄️' };
    case 75:
      return { description: 'Silné sněžení', emoji: '❄️' };
    case 77:
      return { description: 'Sněhové krupky', emoji: '❄️' };
    case 80:
    case 81:
    case 82:
      return { description: 'Přeháňky', emoji: '🌧' };
    case 85:
    case 86:
      return { description: 'Sněhové přeháňky', emoji: '❄️' };
    case 95:
      return { description: 'Mírná bouřka', emoji: '⛈' };
    case 96:
    case 99:
      return { description: 'Bouřka s kroupami', emoji: '⛈' };
    default:
      return { description: 'Neznámé počasí', emoji: '🌤' };
  }
}

export const useWeatherStore = create<WeatherState>((set, get) => ({
  weatherData: null,
  forecast: [],
  isLoading: false,
  cityName: 'Praha',
  latitude: 50.0755,
  longitude: 14.4378,

  fetchWeather: async (lat, lon, name = '') => {
    set({ isLoading: true, latitude: lat, longitude: lon });
    if (name) {
      set({ cityName: name });
    }

    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      if (!response.ok) throw new Error('Chyba Open-Meteo API');

      const data = await response.json();
      
      const current = data.current;
      const mappedCurrent = mapWMOCode(current.weather_code);

      const currentWeather: WeatherData = {
        temp: Math.round(current.temperature_2m),
        apparentTemp: Math.round(current.apparent_temperature),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code,
        description: mappedCurrent.description,
        emoji: mappedCurrent.emoji
      };

      const daily = data.daily;
      const forecastDays: ForecastDay[] = [];
      
      // Zpracujeme 5 dní předpovědi
      for (let i = 0; i < 5; i++) {
        if (!daily.time[i]) break;
        const mappedDaily = mapWMOCode(daily.weather_code[i]);
        forecastDays.push({
          date: daily.time[i],
          weatherCode: daily.weather_code[i],
          tempMax: Math.round(daily.temperature_2m_max[i]),
          tempMin: Math.round(daily.temperature_2m_min[i]),
          description: mappedDaily.description,
          emoji: mappedDaily.emoji
        });
      }

      set({
        weatherData: currentWeather,
        forecast: forecastDays,
        isLoading: false
      });
    } catch (err) {
      console.warn('[Weather Store] Nepodařilo se stáhnout reálná data počasí, spouštím mock data.', err);
      
      // Mock data fallback
      const mockMapped = mapWMOCode(2);
      const mockCurrent: WeatherData = {
        temp: 21,
        apparentTemp: 22,
        humidity: 58,
        windSpeed: 12,
        weatherCode: 2,
        description: mockMapped.description,
        emoji: mockMapped.emoji
      };

      const mockForecast: ForecastDay[] = [
        { date: new Date().toISOString().split('T')[0], weatherCode: 2, tempMax: 23, tempMin: 12, ...mapWMOCode(2) },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], weatherCode: 80, tempMax: 18, tempMin: 11, ...mapWMOCode(80) },
        { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], weatherCode: 0, tempMax: 24, tempMin: 13, ...mapWMOCode(0) },
        { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], weatherCode: 1, tempMax: 22, tempMin: 12, ...mapWMOCode(1) },
        { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], weatherCode: 3, tempMax: 19, tempMin: 10, ...mapWMOCode(3) }
      ];

      set({
        weatherData: mockCurrent,
        forecast: mockForecast,
        isLoading: false
      });
    }
  },

  detectLocationAndFetch: async () => {
    if (!navigator.geolocation) {
      console.warn('[Weather Store] Prohlížeč nepodporuje geolokaci, načítám Prahu.');
      await get().fetchWeather(50.0755, 14.4378, 'Praha');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        // Pokusíme se načíst název města přes reverse geocoding nebo necháme "Moje poloha"
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.municipality || data.address?.village || 'Moje poloha';
          await get().fetchWeather(lat, lon, city);
        } catch (e) {
          await get().fetchWeather(lat, lon, 'Moje poloha');
        }
      },
      async (error) => {
        console.warn('[Weather Store] Geolokace zamítnuta nebo selhala, načítám Prahu.', error);
        await get().fetchWeather(50.0755, 14.4378, 'Praha');
      },
      { timeout: 8000 }
    );
  }
}));
