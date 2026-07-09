import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genai = new GoogleGenerativeAI(apiKey);

interface PhotoSpotRequest {
  city: string;
  date: string;
  photoStyle?: 'romantic' | 'adventurous' | 'glamorous' | 'natural';
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'golden-hour';
  accessibilityNeeded?: boolean;
}

// Photo location recommendation endpoint
export async function POST(request: NextRequest) {
  try {
    const body: PhotoSpotRequest = await request.json();
    const {
      city,
      date,
      photoStyle = 'romantic',
      timeOfDay = 'golden-hour',
      accessibilityNeeded = false,
    } = body;

    const model = genai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
You are an expert photography location scout specializing in romantic celebration photography in South Africa.

Provide the best photo locations in ${city} for a birthday celebration.

Requirements:
- Date: ${date}
- Style: ${photoStyle}
- Lighting preference: ${timeOfDay}
- Must be accessible: ${accessibilityNeeded ? 'Yes' : 'No'}

For each location, provide:
1. Name
2. Specific directions/address details
3. Best time for photos (specific time window)
4. Lighting conditions at that time
5. Why it's perfect for couple photos
6. Accessibility score (1-10)
7. Estimated travel time from city center
8. Parking availability
9. Best photo angles/spots within location
10. Any permits or restrictions

Return ONLY valid JSON with this exact structure:
{
  "photoSpots": [
    {
      "id": "photo_1",
      "name": "Location Name",
      "description": "What makes it special for photos",
      "directions": "How to get there",
      "bestTime": "14:00-16:30",
      "lighting": "golden-hour",
      "photoAngles": ["Angle 1", "Angle 2", "Angle 3"],
      "accessibilityScore": 8,
      "distance": 4.2,
      "parking": "Free parking available",
      "restrictions": "Open until sunset",
      "rating": 4.8,
      "whySpecial": "Detailed reason for celebrations",
      "photoTips": "Specific photography advice"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse photo spot recommendations');
    }

    const recommendations = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: recommendations.photoSpots,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Photo spot recommendation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate photo spot recommendations' },
      { status: 500 }
    );
  }
}
