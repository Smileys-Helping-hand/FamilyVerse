// actions/weather.ts
'use server';

const WEATHER_CODES: Record<number, string> = {
  0: '☀️ Sunny',
  1: '⛅ Partly Cloudy',
  2: '☁️ Cloudy',
  3: '☁️ Overcast',
  45: '🌫️ Fog',
  48: '🌫️ Fog',
  51: '🌦️ Drizzle',
  53: '🌦️ Drizzle',
  55: '🌦️ Drizzle',
  56: '🌧️ Freezing Drizzle',
  57: '🌧️ Freezing Drizzle',
  61: '🌧️ Rain',
  63: '🌧️ Rain',
  65: '🌧️ Rain',
  66: '🌧️ Freezing Rain',
  67: '🌧️ Freezing Rain',
  71: '❄️ Snow',
  73: '❄️ Snow',
  75: '❄️ Snow',
  77: '❄️ Snow Grains',
  80: '🌦️ Showers',
  81: '🌦️ Showers',
  82: '🌦️ Showers',
  85: '❄️ Snow Showers',
  86: '❄️ Snow Showers',
  95: '⛈️ Thunderstorm',
  96: '⛈️ Thunderstorm',
  99: '⛈️ Thunderstorm',
};

export async function getForecast(lat: number, lng: number, date: string) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather fetch failed');
  const data = await res.json();
  const idx = data.daily.time.findIndex((d: string) => d === date);
  if (idx === -1) throw new Error('No forecast for this date');
  const maxTemp = data.daily.temperature_2m_max[idx];
  const minTemp = data.daily.temperature_2m_min[idx];
  const rainChance = data.daily.precipitation_probability_max[idx];
  const code = data.daily.weathercode[idx];
  let condition = WEATHER_CODES[code] || '🌈 Unknown';
  // Rain warning
  if (rainChance >= 60) condition = '🌧️ Rain Warning!';
  return { maxTemp, minTemp, rainChance, condition };
}
