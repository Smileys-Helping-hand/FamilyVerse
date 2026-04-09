import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

// WMO weather code → readable label
const WMO_CODES: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
  61: 'Slight rain', 63: 'Rain', 65: 'Heavy rain', 71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
  80: 'Showers', 81: 'Showers', 82: 'Violent showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm with hail',
};

export interface WeatherDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipMm: number;
  weatherCode: number;
  description: string;
}

export async function POST(req: NextRequest) {
  let lat: number, lng: number, eventType: string, venue: string;

  try {
    const body = await req.json();
    lat = parseFloat(body.lat);
    lng = parseFloat(body.lng);
    eventType = String(body.eventType ?? 'other');
    venue = String(body.venue ?? '');

    if (isNaN(lat) || isNaN(lng)) throw new Error('invalid coords');
    // Basic range validation
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) throw new Error('coords out of range');
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  // ── 1. Fetch 5-day forecast from Open-Meteo (free, no key required) ──
  let weather: WeatherDay[] = [];
  try {
    const meteoUrl = new URL('https://api.open-meteo.com/v1/forecast');
    meteoUrl.searchParams.set('latitude', lat.toString());
    meteoUrl.searchParams.set('longitude', lng.toString());
    meteoUrl.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode');
    meteoUrl.searchParams.set('timezone', 'auto');
    meteoUrl.searchParams.set('forecast_days', '5');

    const meteoRes = await fetch(meteoUrl.toString(), { next: { revalidate: 3600 } });
    if (meteoRes.ok) {
      const meteoData = await meteoRes.json();
      const d = meteoData.daily;
      weather = (d.time as string[]).map((date: string, i: number) => ({
        date,
        maxTemp: Math.round(d.temperature_2m_max[i]),
        minTemp: Math.round(d.temperature_2m_min[i]),
        precipMm: Math.round(d.precipitation_sum[i] * 10) / 10,
        weatherCode: d.weathercode[i],
        description: WMO_CODES[d.weathercode[i]] ?? 'Unknown',
      }));
    }
  } catch (e) {
    console.warn('[venue-intel] Open-Meteo fetch failed:', e);
  }

  // ── 2. Gemini activity suggestions ──
  let suggestions: string[] = [];
  try {
    const weatherSummary = weather.length
      ? weather
          .slice(0, 3)
          .map((w) => `${w.date}: ${w.description}, ${w.maxTemp}°C`)
          .join('; ')
      : 'weather unknown';

    const prompt = `Venue: "${venue || 'unknown location'}". Event type: ${eventType}. Upcoming weather: ${weatherSummary}.
List 5 concise, practical activity suggestions for this specific venue and weather. Each suggestion must be max 10 words.
Return only a JSON array of strings, no other text. Example: ["suggestion 1", "suggestion 2"]`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 256 },
    });

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    if (Array.isArray(parsed)) {
      suggestions = parsed.slice(0, 5).map(String);
    }
  } catch (e) {
    console.warn('[venue-intel] Gemini suggestions failed:', e);
    suggestions = [];
  }

  return NextResponse.json({ weather, suggestions });
}
