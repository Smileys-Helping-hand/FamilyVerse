import { db } from '@/lib/db';
import { guestRsvps, events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import GuestRsvpForm from './GuestRsvpForm';

interface Props {
  params: { token: string };
}

export default async function MagicLinkRsvpPage({ params }: Props) {
  const { token } = params;

  // Validate token
  if (!token || token.length < 8 || token.length > 64) notFound();

  // Server-side DB lookup
  const [rsvp] = await db
    .select()
    .from(guestRsvps)
    .where(eq(guestRsvps.token, token));

  if (!rsvp) notFound();

  if (rsvp.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
        <div className="text-center space-y-3">
          <p className="text-4xl">⏳</p>
          <h1 className="text-xl font-bold text-zinc-100">This invite has expired</h1>
          <p className="text-zinc-500 text-sm">Ask the host for a fresh link.</p>
        </div>
      </div>
    );
  }

  // Load event
  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      locationName: events.locationName,
      startTime: events.startTime,
      heroImageUrl: events.heroImageUrl,
    })
    .from(events)
    .where(eq(events.id, rsvp.eventId));

  if (!event) notFound();

  const alreadyResponded = rsvp.rsvpStatus !== 'PENDING';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      {/* Blurred venue image background */}
      {event.heroImageUrl && (
        <div
          className="fixed inset-0 bg-cover bg-center opacity-10 blur-2xl pointer-events-none"
          style={{ backgroundImage: `url(${event.heroImageUrl})` }}
        />
      )}

      <div className="relative z-10 w-full max-w-sm">
        {/* Gang Gear logo */}
        <div className="text-center mb-6">
          <p className="text-[#00FF66] font-extrabold text-xl tracking-tight drop-shadow-[0_0_12px_rgba(0,255,102,0.5)]">
            Gang Gear
          </p>
          <p className="text-zinc-600 text-xs mt-0.5">Fast-Pass RSVP</p>
        </div>

        {/* Event card */}
        <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-hidden mb-4">
          {event.heroImageUrl ? (
            <img
              src={event.heroImageUrl}
              alt={event.title}
              className="w-full h-36 object-cover"
            />
          ) : (
            <div className="w-full h-20 bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center">
              <span className="text-3xl">🎯</span>
            </div>
          )}

          <div className="p-4 space-y-1">
            <h1 className="text-lg font-bold text-zinc-100 leading-tight">{event.title}</h1>
            {event.locationName && (
              <p className="text-sm text-zinc-400">{event.locationName}</p>
            )}
            {event.startTime && (
              <p className="text-xs text-[#00FF66]">
                {new Date(event.startTime).toLocaleDateString('en', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {alreadyResponded ? (
          <div className="rounded-2xl border border-[#00FF66]/30 bg-zinc-900/80 backdrop-blur-xl p-6 text-center space-y-2">
            <p className="text-2xl">{rsvp.rsvpStatus === 'GOING' ? '✅' : '😔'}</p>
            <p className="text-zinc-100 font-semibold">
              {rsvp.rsvpStatus === 'GOING' ? `You're in, ${rsvp.guestName}!` : "You've declined."}
            </p>
            <p className="text-zinc-500 text-sm">
              {rsvp.rsvpStatus === 'GOING'
                ? 'See you there. Check back for updates.'
                : 'Changed your mind? Use the link again.'}
            </p>
            {rsvp.rsvpStatus === 'CANT_MAKE_IT' && (
              <GuestRsvpForm token={token} defaultName={rsvp.guestName ?? ''} allowReRsvp />
            )}
          </div>
        ) : (
          <GuestRsvpForm token={token} defaultName={rsvp.guestName ?? ''} />
        )}
      </div>
    </div>
  );
}
