let resend: any = null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@familyverse.app';

try {
  // @ts-ignore - Optional dependency
  const { Resend } = require('resend');
  resend = new Resend(process.env.RESEND_API_KEY);
} catch (error) {
  console.warn('Resend not installed. Email functionality disabled.');
}

export async function sendEventInvitation(
  recipientEmail: string,
  recipientName: string,
  eventTitle: string,
  eventDate: Date,
  eventDescription: string,
  rsvpLink: string,
  senderName: string
) {
  try {
    if (!resend) {
      return { success: false, error: 'Resend service not configured' };
    }
    const eventDateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">You're Invited!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">${senderName} invited you to an event</p>
        </div>

        <div style="background: white; padding: 40px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px;">${eventTitle}</h2>

          <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Event Details</p>
            <p style="margin: 5px 0; color: #1f2937; font-size: 16px;">
              <strong>📅 Date & Time:</strong> ${eventDateStr}
            </p>
            <p style="margin: 10px 0; color: #4b5563; font-size: 15px;">
              ${eventDescription}
            </p>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${rsvpLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
              Respond to Invitation
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 0;">
            Or copy and paste this link in your browser:<br/>
            <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${rsvpLink}</code>
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px;">
          <p style="margin: 0;">FamilyVerse • Making family moments memorable</p>
          <p style="margin: 5px 0 0 0;">You received this email because you were invited to an event.</p>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `You're invited: ${eventTitle}`,
      html,
      replyTo: FROM_EMAIL,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: 'Failed to send invitation email' };
  }
}

export async function sendRsvpReminder(
  recipientEmail: string,
  recipientName: string,
  eventTitle: string,
  eventDate: Date,
  rsvpLink: string
) {
  try {
    if (!resend) {
      return { success: false, error: 'Resend service not configured' };
    }
    const eventDateStr = eventDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #667eea; border-radius: 4px;">
          <p style="margin: 0; color: #1f2937; font-size: 16px;">
            <strong>Friendly Reminder!</strong>
          </p>
          <p style="margin: 10px 0 0 0; color: #4b5563; font-size: 14px;">
            We haven't heard from you yet about <strong>${eventTitle}</strong> on <strong>${eventDateStr}</strong>.
          </p>
          <p style="margin: 15px 0 0 0; color: #4b5563; font-size: 14px;">
            Please let us know if you can make it!
          </p>
          <a href="${rsvpLink}" style="display: inline-block; margin-top: 15px; background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
            Respond Now
          </a>
        </div>
      </div>
    `;

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject: `Reminder: ${eventTitle} on ${eventDateStr}`,
      html,
      replyTo: FROM_EMAIL,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Failed to send reminder:', error);
    return { success: false, error: 'Failed to send reminder email' };
  }
}
