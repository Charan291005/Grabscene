import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface SendEmailParams {
  to: string;
  subject: string;
  react: React.ReactElement;
}

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  // If no API key is provided, gracefully fallback to mock mode for evaluation
  if (!resend) {
    console.log(`\n\n[MOCK EMAIL MODE] Dispatched to: ${to}`);
    console.log(`[SUBJECT]: ${subject}`);
    try {
      const htmlString = await render(react);
      console.log(`[HTML PAYLOAD TRUNCATED]:\n${htmlString.substring(0, 500)}...\n\n`);
      return { success: true, mocked: true, mockHtml: htmlString };
    } catch (e) {
      console.log(`[FAILED TO RENDER HTML]`);
      return { success: false, error: 'Render Failed' };
    }
  }

  try {
    const data = await resend.emails.send({
      from: 'GrabScene Tickets <tickets@grabscene.app>', // Need verified domain on Resend in production
      to,
      subject,
      react,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    throw error;
  }
}
