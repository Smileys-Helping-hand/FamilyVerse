import React, { useEffect, useState } from "react";

export function WeatherForecast({ lat, lng, date, onSnapshot }: {
  lat: number;
  lng: number;
  date: string; // YYYY-MM-DD
  onSnapshot?: (snapshot: any) => void;
}) {
  const [forecast, setForecast] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lat || !lng || !date) return;
    setLoading(true);
    setError(null);
    const start = `${date}T00:00:00Z`;
    const end = `${date}T23:59:59Z`;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=precipitation_probability,temperature_2m,windspeed_10m&start=${start}&end=${end}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setForecast(data);
        if (onSnapshot) onSnapshot(data);
      })
      .catch(() => setError("Could not fetch weather."))
      .finally(() => setLoading(false));
  }, [lat, lng, date]);

  if (loading) return <div className="text-gray-500">Loading weather...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!forecast) return null;

  const rainArr = forecast.hourly?.precipitation_probability || [];
  const windArr = forecast.hourly?.windspeed_10m || [];
  const tempArr = forecast.hourly?.temperature_2m || [];
  const maxRain = Math.max(...rainArr);
  const maxWind = Math.max(...windArr);
  const avgTemp = tempArr.length ? (tempArr.reduce((a: number, b: number) => a + b, 0) / tempArr.length).toFixed(1) : null;

  return (
    <div className="mt-4 p-4 rounded-lg border bg-blue-50">
      <div className="font-semibold mb-1">Weather Forecast</div>
      <div className="flex gap-4 items-center">
        <span>🌡️ Avg Temp: {avgTemp}°C</span>
        <span>💧 Max Rain: {maxRain}%</span>
        <span>💨 Max Wind: {maxWind} km/h</span>
      </div>
      {(maxRain > 40 || maxWind > 30) && (
        <div className="mt-2 text-yellow-900 bg-yellow-200 rounded p-2 font-bold flex items-center gap-2">
          ⚠️ High chance of rain or wind. Consider an indoor venue!
        </div>
      )}
    </div>
  );
}
