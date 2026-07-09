import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genai = new GoogleGenerativeAI(apiKey);

interface ItineraryRequest {
  city: string;
  date: string;
  startTime?: string;
  endTime?: string;
  budget: number;
  interests: string[];
  guestCount: number;
  mobility?: 'high' | 'moderate' | 'limited';
}

interface TimeSlot {
  time: string;
  duration: number;
  activity: string;
  location: string;
  description: string;
  estimatedCost?: number;
  notes: string;
  travelTime?: number;
}

// Itinerary builder endpoint
export async function POST(request: NextRequest) {
  try {
    const body: ItineraryRequest = await request.json();
    const {
      city,
      date,
      startTime = '09:00',
      endTime = '22:00',
      budget,
      interests = [],
      guestCount,
      mobility = 'moderate',
    } = body;

    const model = genai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
Create the perfect birthday celebration itinerary for ${city}.

Details:
- Date: ${date}
- Time: ${startTime} to ${endTime}
- Budget: R${budget} total (R${Math.floor(budget / guestCount)} per person)
- Group size: ${guestCount} people
- Interests: ${interests.join(', ')}
- Mobility: ${mobility}

Create a detailed hour-by-hour itinerary that:
1. Maximizes the celebration experience
2. Stays within budget
3. Includes travel time between locations
4. Features a special dinner/meal experience
5. Includes photo opportunities at beautiful locations
6. Has downtime for relaxation
7. Ends with a memorable moment

For each activity, provide:
- Exact time
- Duration (in minutes)
- Activity name
- Specific location/venue
- Why it's special
- Estimated cost
- Travel time from previous location
- Pro tips

Return ONLY valid JSON:
{
  "itinerary": [
    {
      "time": "09:00",
      "duration": 90,
      "activity": "Activity Name",
      "location": "Specific Location",
      "description": "What you'll do",
      "estimatedCost": 0,
      "notes": "Pro tips and details",
      "travelTimeFromPrevious": 0
    }
  ],
  "summary": {
    "totalTime": 13,
    "totalCost": 2500,
    "highlights": ["Highlight 1", "Highlight 2"],
    "photoOpportunities": 3,
    "meals": 2
  }
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse itinerary');
    }

    const itineraryData = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: itineraryData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Itinerary generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}
