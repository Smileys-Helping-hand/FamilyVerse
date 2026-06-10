import { NextRequest, NextResponse } from 'next/server';

interface BookingRequest {
  eventId: string;
  venueName: string;
  guestCount: number;
  date: string;
  time?: string;
  guestEmail?: string;
  guestPhone?: string;
}

interface BookingDraft {
  venueName: string;
  guestCount: number;
  date: string;
  estimatedPrice?: number;
  reference: string;
  confirmUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: BookingRequest = await request.json();
    const { eventId, venueName, guestCount, date, guestEmail } = body;

    if (!venueName || !guestCount || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: venueName, guestCount, date' },
        { status: 400 }
      );
    }

    // Generate booking reference
    const reference = `BK-${Date.now().toString(36).toUpperCase()}`;

    // Create booking draft with venue details
    const draft: BookingDraft = {
      venueName,
      guestCount,
      date,
      reference,
      estimatedPrice: Math.round(guestCount * 150 + Math.random() * 500), // Mock pricing
    };

    // Generate booking URLs for different platforms
    const searchQuery = encodeURIComponent(
      `${venueName} venue booking ${guestCount} people ${new Date(date).toLocaleDateString()}`
    );

    // Store booking in memory/DB (mock implementation)
    const booking = {
      id: reference,
      eventId,
      ...draft,
      createdAt: new Date().toISOString(),
      status: 'draft',
      bookingUrl: `https://www.google.com/search?q=${searchQuery}`,
      // Alternative booking platforms
      alternatives: {
        airbnb: `https://www.airbnb.com/s/${venueName}/homes?guests=${guestCount}&tab_id=home_tab`,
        eventbrite: `https://www.eventbrite.com/e/search?q=${venueName}&type=venues`,
        booking: `https://www.booking.com/searchresults.html?ss=${venueName}&group_adults=${guestCount}`,
      }
    };

    return NextResponse.json({
      success: true,
      booking,
      draft,
      message: 'Booking draft created successfully',
    });
  } catch (error) {
    console.error('[Bookings API Error]:', error);
    return NextResponse.json(
      { error: 'Failed to create booking draft' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve booking details
export async function GET(request: NextRequest) {
  const eventId = request.nextUrl.searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json(
      { error: 'Missing eventId parameter' },
      { status: 400 }
    );
  }

  // Mock: retrieve booking for event
  return NextResponse.json({
    success: true,
    eventId,
    bookings: [], // Would come from DB
    message: 'No bookings found for this event yet',
  });
}
