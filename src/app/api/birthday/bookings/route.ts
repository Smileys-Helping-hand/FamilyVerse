import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
const genai = new GoogleGenerativeAI(apiKey);

interface BookingRequest {
  eventId: string;
  restaurantName: string;
  date: string;
  time: string;
  guestCount: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  specialRequests?: string;
  occasionType: 'birthday' | 'anniversary' | 'proposal' | 'celebration';
}

interface BookingResponse {
  success: boolean;
  bookingId?: string;
  confirmationUrl?: string;
  status?: string;
  estimatedPrice?: number;
  bookingDetails?: {
    confirmation: string;
    bookingReference: string;
    cancellationPolicy: string;
    reminders: string[];
  };
  error?: string;
}

// Restaurant booking endpoint
export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    const {
      eventId,
      restaurantName,
      date,
      time,
      guestCount,
      userName,
      userEmail,
      userPhone,
      specialRequests,
      occasionType,
    } = body;

    // Generate booking confirmation
    const bookingId = generateBookingId();

    const model = genai.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
Generate a professional restaurant booking confirmation for:

Restaurant: ${restaurantName}
Date: ${date}
Time: ${time}
Guests: ${guestCount}
Name: ${userName}
Occasion: ${occasionType}
Special Requests: ${specialRequests || 'None'}

Create a booking confirmation email that includes:
1. Booking reference number
2. Restaurant details
3. Date, time, party size
4. Cancellation policy
5. Parking information
6. Arrival recommendations
7. Restaurant phone number (realistic for SA)
8. Set reminders (24h before, 2h before)
9. Special celebration tips

Format as a professional email.
`;

    const result = await model.generateContent(prompt);
    const confirmationText = result.response.text();

    // In production, you would:
    // 1. Contact actual restaurant booking APIs (Dine, Eatout, etc.)
    // 2. Send actual confirmation emails
    // 3. Store booking in database

    // Store booking in database (mock for now)
    const bookingDetails = {
      confirmation: confirmationText,
      bookingReference: bookingId,
      cancellationPolicy: '24 hours notice for free cancellation',
      reminders: [
        `${new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]} at 10:00`,
        `${date} at ${time}`,
      ],
    };

    // Send confirmation email (would use service like Resend in production)
    console.log(`Sending booking confirmation to ${userEmail}`);

    const response: BookingResponse = {
      success: true,
      bookingId: bookingId,
      status: 'CONFIRMED',
      estimatedPrice: 500 * guestCount, // Mock pricing
      bookingDetails: bookingDetails,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process booking. Please try again or contact the restaurant directly.',
      },
      { status: 500 }
    );
  }
}

function generateBookingId(): string {
  return `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}
