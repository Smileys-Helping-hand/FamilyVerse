import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get('location');
  const date = searchParams.get('date');

  if (!location) {
    return NextResponse.json({ error: 'Location required' }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a weather assistant for South Africa. Given a location and date, provide a realistic weather estimate.

Location: ${location}
Date: ${date || 'upcoming weekend'}

Respond with ONLY a JSON object like:
{
  "temp": 22,
  "condition": "Partly cloudy",
  "description": "Warm and pleasant with some cloud cover. Light breeze.",
  "recommendation": "Great day for outdoor events! Bring sunscreen.",
  "uvIndex": "High",
  "wind": "Light 15 km/h"
}

Base this on typical South African weather patterns for the given month and location. Keep it realistic.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const weatherData = JSON.parse(jsonMatch[0]);
      return NextResponse.json(weatherData);
    }

    return NextResponse.json({
      temp: 22,
      condition: 'Partly cloudy',
      description: 'Typical Cape Town weather — pleasant with some cloud.',
      recommendation: 'Good day for outdoor activities.',
      uvIndex: 'Moderate',
      wind: 'Light breeze',
    });
  } catch (error) {
    return NextResponse.json({
      temp: 22,
      condition: 'Partly cloudy',
      description: 'Weather data unavailable — check closer to the date.',
      recommendation: 'Check a weather app for the latest forecast.',
    });
  }
}
