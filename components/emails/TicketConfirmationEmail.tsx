import React from 'react';
import { Html, Head, Body, Container, Section, Text, Img, Row, Column } from '@react-email/components';

interface SeatInfo {
  row: string;
  number: string;
  category: string;
  price: number;
}

interface TicketEmailProps {
  bookingRef: string;
  eventTitle: string;
  venueName: string;
  showDate: string;
  showTime: string;
  seats: SeatInfo[];
  qrCodeDataUrl: string;
  passUrl: string;
}

export const TicketConfirmationEmail = ({
  bookingRef = "GS-0000-XX",
  eventTitle = "Hans Zimmer Live",
  venueName = "O2 Arena, London",
  showDate = "Friday, Aug 21, 2026",
  showTime = "20:00",
  seats = [{ row: 'A', number: '12', category: 'VIP', price: 150 }],
  qrCodeDataUrl = "",
  passUrl = "http://localhost:3000/tickets/GS-0000-XX"
}: TicketEmailProps) => {
  const total = seats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#050810', color: '#f4f4f5', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ margin: '0 auto', padding: '40px 20px', maxWidth: '600px' }}>
          
          {/* Header Banner */}
          <Section style={{ backgroundColor: '#0c111d', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '32px', textAlign: 'center', backgroundImage: 'linear-gradient(to bottom, rgba(6, 182, 212, 0.1), transparent)' }}>
              <Text style={{ margin: 0, color: '#22d3ee', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Booking Confirmed
              </Text>
              <Text style={{ margin: '8px 0 0', color: '#ffffff', fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                {eventTitle}
              </Text>
              <Text style={{ margin: '8px 0 0', color: '#a1a1aa', fontSize: '14px' }}>
                {showDate} • {showTime}
              </Text>
              <Text style={{ margin: '4px 0 0', color: '#a1a1aa', fontSize: '14px' }}>
                {venueName}
              </Text>
            </div>
          </Section>

          {/* QR Code Section */}
          <Section style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '24px' }}>
            <Text style={{ margin: '0 0 16px', color: '#18181b', fontSize: '18px', fontWeight: 'bold' }}>
              Your Mobile Pass
            </Text>
            {qrCodeDataUrl ? (
              <Img src={qrCodeDataUrl} width="200" height="200" alt="Ticket QR Code" style={{ margin: '0 auto', display: 'block', backgroundColor: '#000', padding: '10px', borderRadius: '8px' }} />
            ) : (
              <div style={{ width: '200px', height: '200px', backgroundColor: '#e4e4e7', margin: '0 auto', borderRadius: '8px' }}></div>
            )}
            <Text style={{ margin: '16px 0 0', color: '#71717a', fontSize: '14px' }}>
              Reference: <strong style={{ color: '#18181b' }}>{bookingRef}</strong>
            </Text>
            <Text style={{ margin: '8px 0 0', color: '#a1a1aa', fontSize: '12px' }}>
              Present this QR code at the venue entrance.
            </Text>
          </Section>

          {/* Seats Summary */}
          <Section style={{ backgroundColor: '#0c111d', border: '1px solid #27272a', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <Text style={{ margin: '0 0 16px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
              Order Summary
            </Text>
            {seats.map((seat, idx) => (
              <Row key={idx} style={{ marginBottom: '8px' }}>
                <Column>
                  <Text style={{ margin: 0, color: '#e4e4e7', fontSize: '14px' }}>
                    Row {seat.row} - Seat {seat.number}
                  </Text>
                  <Text style={{ margin: 0, color: '#a1a1aa', fontSize: '12px' }}>
                    {seat.category}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={{ margin: 0, color: '#e4e4e7', fontSize: '14px', fontWeight: 'bold' }}>
                    ${seat.price.toFixed(2)}
                  </Text>
                </Column>
              </Row>
            ))}
            <hr style={{ borderTop: '1px solid #27272a', borderBottom: 'none', margin: '16px 0' }} />
            <Row>
              <Column>
                <Text style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>Total</Text>
              </Column>
              <Column align="right">
                <Text style={{ margin: 0, color: '#10b981', fontSize: '18px', fontWeight: 'bold' }}>
                  ${total.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Action Button */}
          <Section style={{ textAlign: 'center' }}>
            <a href={passUrl} style={{ backgroundColor: '#22d3ee', color: '#083344', padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', fontSize: '16px' }}>
              View Digital Pass in Browser
            </a>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};
export default TicketConfirmationEmail;
