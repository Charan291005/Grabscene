import QRCode from 'qrcode';
import crypto from 'crypto';

const HMAC_SECRET = process.env.QR_HMAC_SECRET || 'dev_secret_key';

export interface TicketPayload {
  ref: string;
  event: string;
  show: string;
}

export function signTicketPayload(payload: TicketPayload): string {
  const dataString = `${payload.ref}:${payload.event}:${payload.show}`;
  const hmac = crypto.createHmac('sha256', HMAC_SECRET);
  hmac.update(dataString);
  return hmac.digest('hex');
}

export async function generateTicketQRCode(payload: TicketPayload): Promise<string> {
  const checksum = signTicketPayload(payload);
  const fullPayload = JSON.stringify({ ...payload, checksum });
  
  try {
    // Generate base64 data URI
    const dataUrl = await QRCode.toDataURL(fullPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#00000000' // transparent background
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code', err);
    throw err;
  }
}
