import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genai = new GoogleGenerativeAI(apiKey);

interface RecommendationRequest {
  city: string;
  date: string;
  budget: number;
  cuisinePreferences?: string[];
  photoPreferences?: string[];
  activityTypes?: string[];
  guestCount?: number;
}

// Restaurant recommendation endpoint
export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { city, date, budget, cuisinePreferences = [], guestCount = 2 } = body;

    const model = genai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
You are an expert event planner specializing in romantic celebrations in South Africa.

Based on this request, provide restaurant recommendations in JSON format.

City: ${city}
Date: ${date}
Budget per person: R${budget / guestCount}
Cuisine preferences: ${cuisinePreferences.join(', ') || 'Any'}
Number of guests: ${guestCount}

Please recommend 5 restaurants that would be perfect for a special celebration. For each restaurant:
1. Name (actual or realistic)
2. Cuisine type
3. Estimated cost per person
4. Rating (out of 5)
5. Why it's perfect for celebrations
6. Distance from city center (km)
7. Special features for couples/celebrations
8. Availability for special requests (cake, champagne, etc.)

IMPORTANT: Return ONLY valid JSON with this structure:
{
  "restaurants": [
    {
      "id": "rest_1",
      "name": "Restaurant Name",
      "cuisine": "Cuisine Type",
      "costPerPerson": 300,
      "rating": 4.7,
      "description": "Why it's perfect for celebrations",
      "distance": 2.5,
      "specialFeatures": ["Feature 1", "Feature 2"],
      "celebrationSpecial": "Details about celebration packages",
      "bookingNotes": "How to book for special occasions"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse restaurant recommendations');
    }

    const recommendations = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: recommendations.restaurants,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
