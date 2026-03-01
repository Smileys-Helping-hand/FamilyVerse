'use server';

import { db } from '@/lib/db';
import {
  events,
  eventAttendees,
  eventWaypoints,
  liveLocations,
  expenses,
  expenseSplits,
  eventPolls,
  pollVotes,
  meetHerePins,
  type NewEvent,
  type NewEventAttendee,
  type NewEventWaypoint,
  type NewLiveLocation,
  type NewExpense,
  type NewExpenseSplit,
  type NewEventPoll,
  type NewPollVote,
  type NewMeetHerePin,
} from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { triggerPartyEvent } from '@/lib/pusher/server';
import { revalidatePath } from 'next/cache';

// ============================================
// EVENTS
// ============================================

export async function createEvent(data: NewEvent) {
  try {
    const [event] = await db.insert(events).values(data).returning();
    revalidatePath('/events');
    return { success: true, event };
  } catch (error) {
    console.error('Failed to create event:', error);
    return { success: false, error: 'Failed to create event' };
  }
}

export async function getEvents(familyId?: string) {
  try {
    const query = familyId
      ? db.select().from(events).where(eq(events.familyId, familyId)).orderBy(desc(events.startTime))
      : db.select().from(events).orderBy(desc(events.startTime));
    
    const allEvents = await query;
    return { success: true, events: allEvents };
  } catch (error) {
    console.error('Failed to get events:', error);
    return { success: false, error: 'Failed to get events', events: [] };
  }
}

export async function getEvent(id: string) {
  try {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) {
      return { success: false, error: 'Event not found' };
    }

    // Get attendees
    const attendeesList = await db
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, id));

    // Get waypoints
    const waypointsList = await db
      .select()
      .from(eventWaypoints)
      .where(eq(eventWaypoints.eventId, id))
      .orderBy(eventWaypoints.sortOrder);

    return {
      success: true,
      event,
      attendees: attendeesList,
      waypoints: waypointsList,
    };
  } catch (error) {
    console.error('Failed to get event:', error);
    return { success: false, error: 'Failed to get event' };
  }
}

export async function updateEventStatus(id: string, status: 'UPCOMING' | 'LIVE' | 'PAST') {
  try {
    await db.update(events).set({ status, updatedAt: new Date() }).where(eq(events.id, id));
    
    // Notify all attendees via Pusher
    await triggerPartyEvent(`event-${id}`, 'status-update', { status }, 'system');
    
    revalidatePath(`/events/${id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update event status:', error);
    return { success: false, error: 'Failed to update status' };
  }
}

// ============================================
// ATTENDEES & RSVP
// ============================================

export async function rsvpToEvent(data: NewEventAttendee) {
  try {
    // Check if already RSVP'd
    const existing = await db
      .select()
      .from(eventAttendees)
      .where(and(eq(eventAttendees.eventId, data.eventId), eq(eventAttendees.userId, data.userId)));

    if (existing.length > 0) {
      // Update existing RSVP
      await db
        .update(eventAttendees)
        .set({ rsvpStatus: data.rsvpStatus, respondedAt: new Date() })
        .where(eq(eventAttendees.id, existing[0].id));
    } else {
      // Create new RSVP
      await db.insert(eventAttendees).values({ ...data, respondedAt: new Date() });
    }

    // Notify via Pusher
    await triggerPartyEvent(`event-${data.eventId}`, 'rsvp-update', {
      userId: data.userId,
      userName: data.userName,
      status: data.rsvpStatus,
    });

    revalidatePath(`/events/${data.eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to RSVP:', error);
    return { success: false, error: 'Failed to RSVP' };
  }
}

export async function getEventAttendees(eventId: string) {
  try {
    const attendeesList = await db
      .select()
      .from(eventAttendees)
      .where(eq(eventAttendees.eventId, eventId));
    return { success: true, attendees: attendeesList };
  } catch (error) {
    console.error('Failed to get attendees:', error);
    return { success: false, error: 'Failed to get attendees', attendees: [] };
  }
}

// ============================================
// WAYPOINTS
// ============================================

export async function addWaypoint(data: NewEventWaypoint) {
  try {
    const [waypoint] = await db.insert(eventWaypoints).values(data).returning();
    
    await triggerPartyEvent(`event-${data.eventId}`, 'waypoint-added', waypoint);
    
    revalidatePath(`/events/${data.eventId}`);
    return { success: true, waypoint };
  } catch (error) {
    console.error('Failed to add waypoint:', error);
    return { success: false, error: 'Failed to add waypoint' };
  }
}

// ============================================
// LIVE LOCATION TRACKING
// ============================================

export async function updateLiveLocation(data: NewLiveLocation) {
  try {
    const now = new Date();
    // Upsert location
    const existing = await db
      .select()
      .from(liveLocations)
      .where(and(eq(liveLocations.eventId, data.eventId), eq(liveLocations.userId, data.userId)));

    if (existing.length > 0) {
      await db
        .update(liveLocations)
        .set({ ...data, lastUpdated: now, lastPingAt: now })
        .where(eq(liveLocations.id, existing[0].id));
    } else {
      await db.insert(liveLocations).values({ ...data, lastPingAt: now });
    }

    // Broadcast via Pusher to presence channel (includes full telemetry)
    if (!data.isGhostMode) {
      await triggerPartyEvent(`presence-event-${data.eventId}`, 'location-update', {
        userId: data.userId,
        userName: data.userName,
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed,
        speedKmh: data.speedKmh ?? data.speed,
        accuracy: data.accuracy,
        batteryLevel: data.batteryLevel ?? null,
        isCharging: data.isCharging ?? null,
        lastPingAt: now.toISOString(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to update location:', error);
    return { success: false, error: 'Failed to update location' };
  }
}

export async function getEventLocations(eventId: string) {
  try {
    const locations = await db
      .select()
      .from(liveLocations)
      .where(and(eq(liveLocations.eventId, eventId), eq(liveLocations.isGhostMode, false)));
    
    return { success: true, locations };
  } catch (error) {
    console.error('Failed to get locations:', error);
    return { success: false, error: 'Failed to get locations', locations: [] };
  }
}

export async function toggleGhostMode(eventId: string, userId: string, enabled: boolean) {
  try {
    await db
      .update(liveLocations)
      .set({ isGhostMode: enabled })
      .where(and(eq(liveLocations.eventId, eventId), eq(liveLocations.userId, userId)));
    
    // Notify others
    await triggerPartyEvent(`presence-event-${eventId}`, 'ghost-mode-toggle', {
      userId,
      enabled,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to toggle ghost mode:', error);
    return { success: false, error: 'Failed to toggle ghost mode' };
  }
}

// ============================================
// EXPENSES (The Kitty)
// ============================================

export async function addExpense(expenseData: NewExpense, splits: Omit<NewExpenseSplit, 'expenseId'>[]) {
  try {
    // Create expense
    const [expense] = await db.insert(expenses).values(expenseData).returning();

    // Create splits
    const splitRecords = splits.map(split => ({
      ...split,
      expenseId: expense.id,
    }));
    await db.insert(expenseSplits).values(splitRecords);

    // Notify via Pusher
    await triggerPartyEvent(`event-${expenseData.eventId}`, 'expense-added', {
      expense,
      splits: splitRecords,
    });

    revalidatePath(`/events/${expenseData.eventId}`);
    return { success: true, expense };
  } catch (error) {
    console.error('Failed to add expense:', error);
    return { success: false, error: 'Failed to add expense' };
  }
}

export async function getEventExpenses(eventId: string) {
  try {
    const expensesList = await db
      .select()
      .from(expenses)
      .where(eq(expenses.eventId, eventId))
      .orderBy(desc(expenses.createdAt));

    // Get splits for each expense
    const expensesWithSplits = await Promise.all(
      expensesList.map(async (expense) => {
        const splitsList = await db
          .select()
          .from(expenseSplits)
          .where(eq(expenseSplits.expenseId, expense.id));
        return { ...expense, splits: splitsList };
      })
    );

    return { success: true, expenses: expensesWithSplits };
  } catch (error) {
    console.error('Failed to get expenses:', error);
    return { success: false, error: 'Failed to get expenses', expenses: [] };
  }
}

export async function settleExpense(splitId: number) {
  try {
    await db
      .update(expenseSplits)
      .set({ isPaid: true, paidAt: new Date() })
      .where(eq(expenseSplits.id, splitId));

    return { success: true };
  } catch (error) {
    console.error('Failed to settle expense:', error);
    return { success: false, error: 'Failed to settle expense' };
  }
}

export async function getSettlementSummary(eventId: string) {
  try {
    // Get all expenses and splits for this event
    const expensesList = await db
      .select()
      .from(expenses)
      .where(eq(expenses.eventId, eventId));

    const allSplits = await Promise.all(
      expensesList.map(async (expense) => {
        const splitsList = await db
          .select()
          .from(expenseSplits)
          .where(eq(expenseSplits.expenseId, expense.id));
        return splitsList.map(split => ({ ...split, payerId: expense.payerId, payerName: expense.payerName }));
      })
    );

    const flatSplits = allSplits.flat();

    // Calculate who owes whom
    const settlements: Record<string, { owed: number; owes: number; name: string }> = {};

    flatSplits.forEach((split) => {
      // Person who is owed
      if (!settlements[split.payerId]) {
        settlements[split.payerId] = { owed: 0, owes: 0, name: split.payerName };
      }
      if (!split.isPaid) {
        settlements[split.payerId].owed += split.amountOwed;
      }

      // Person who owes
      if (!settlements[split.userId]) {
        settlements[split.userId] = { owed: 0, owes: 0, name: split.userName };
      }
      if (!split.isPaid) {
        settlements[split.userId].owes += split.amountOwed;
      }
    });

    return { success: true, settlements };
  } catch (error) {
    console.error('Failed to get settlement summary:', error);
    return { success: false, error: 'Failed to get settlement summary', settlements: {} };
  }
}

// ============================================
// POLLS
// ============================================

export async function createPoll(data: NewEventPoll) {
  try {
    const [poll] = await db.insert(eventPolls).values(data).returning();

    await triggerPartyEvent(`event-${data.eventId}`, 'poll-created', poll);

    revalidatePath(`/events/${data.eventId}`);
    return { success: true, poll };
  } catch (error) {
    console.error('Failed to create poll:', error);
    return { success: false, error: 'Failed to create poll' };
  }
}

export async function votePoll(data: NewPollVote) {
  try {
    // Check if already voted
    const existing = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, data.pollId), eq(pollVotes.userId, data.userId)));

    if (existing.length > 0) {
      // Update vote
      await db
        .update(pollVotes)
        .set({ optionIndex: data.optionIndex, votedAt: new Date() })
        .where(eq(pollVotes.id, existing[0].id));
    } else {
      // Create new vote
      await db.insert(pollVotes).values(data);
    }

    // Get updated poll results
    const votes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, data.pollId));

    // Broadcast via Pusher
    const poll = await db.select().from(eventPolls).where(eq(eventPolls.id, data.pollId));
    await triggerPartyEvent(`event-${poll[0].eventId}`, 'poll-vote', {
      pollId: data.pollId,
      votes,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to vote:', error);
    return { success: false, error: 'Failed to vote' };
  }
}

export async function getEventPolls(eventId: string) {
  try {
    const polls = await db
      .select()
      .from(eventPolls)
      .where(eq(eventPolls.eventId, eventId))
      .orderBy(desc(eventPolls.createdAt));

    // Get votes for each poll
    const pollsWithVotes = await Promise.all(
      polls.map(async (poll) => {
        const votes = await db.select().from(pollVotes).where(eq(pollVotes.pollId, poll.id));
        return { ...poll, votes };
      })
    );

    return { success: true, polls: pollsWithVotes };
  } catch (error) {
    console.error('Failed to get polls:', error);
    return { success: false, error: 'Failed to get polls', polls: [] };
  }
}

export async function closePoll(pollId: string) {
  try {
    await db.update(eventPolls).set({ isClosed: true }).where(eq(eventPolls.id, pollId));

    const poll = await db.select().from(eventPolls).where(eq(eventPolls.id, pollId));
    await triggerPartyEvent(`event-${poll[0].eventId}`, 'poll-closed', { pollId });

    return { success: true };
  } catch (error) {
    console.error('Failed to close poll:', error);
    return { success: false, error: 'Failed to close poll' };
  }
}

// ============================================
// MEET-HERE PINS
// ============================================

export async function addMeetHerePin(data: NewMeetHerePin) {
  try {
    const [pin] = await db.insert(meetHerePins).values(data).returning();

    await triggerPartyEvent(`event-${data.eventId}`, 'meet-here-pin', pin);

    return { success: true, pin };
  } catch (error) {
    console.error('Failed to add pin:', error);
    return { success: false, error: 'Failed to add pin' };
  }
}

export async function getMeetHerePins(eventId: string) {
  try {
    const pins = await db
      .select()
      .from(meetHerePins)
      .where(eq(meetHerePins.eventId, eventId))
      .orderBy(desc(meetHerePins.createdAt));

    // Filter out expired pins
    const activePins = pins.filter(pin => !pin.expiresAt || new Date(pin.expiresAt) > new Date());

    return { success: true, pins: activePins };
  } catch (error) {
    console.error('Failed to get pins:', error);
    return { success: false, error: 'Failed to get pins', pins: [] };
  }
}

// ============================================
// WEATHER API (Simple Integration)
// ============================================

export async function getWeatherForecast(lat: number, lng: number, date: Date) {
  try {
    // Using Open-Meteo (free, no API key needed)
    const dateStr = date.toISOString().split('T')[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.daily) {
      return {
        success: true,
        weather: {
          tempMax: data.daily.temperature_2m_max[0],
          tempMin: data.daily.temperature_2m_min[0],
          precipitation: data.daily.precipitation_sum[0],
          weatherCode: data.daily.weathercode[0],
        },
      };
    }

    return { success: false, error: 'No weather data available' };
  } catch (error) {
    console.error('Failed to get weather:', error);
    return { success: false, error: 'Failed to get weather forecast' };
  }
}

// ============================================
// OVERWATCH: ADMIN PING
// ============================================

export async function sendAdminPing(targetUserId: string, adminName: string, eventId: string) {
  try {
    // Pusher real-time ping
    await triggerPartyEvent(
      `presence-event-${eventId}`,
      'admin-ping',
      { targetUserId, adminName, timestamp: new Date().toISOString() }
    );

    // Web Push notification (works even if app is closed)
    const { sendPush } = await import('@/actions/push');
    await sendPush(targetUserId, {
      title: '🚨 Admin Check-In',
      body: `${adminName} is checking in: Are you okay?`,
      url: `/events/${eventId}`,
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send admin ping:', error);
    return { success: false, error: 'Failed to send ping' };
  }
}
