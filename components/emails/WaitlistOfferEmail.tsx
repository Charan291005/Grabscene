import React from 'react';
import { Html, Head, Body, Container, Section, Text, Row, Column } from '@react-email/components';

interface WaitlistOfferEmailProps {
  eventTitle: string;
  venueName: string;
  seatCategory: string;
  seatRow: string;
  seatNumber: string;
  price: number;
  claimUrl: string;
  expiresInMinutes: number;
}

export const WaitlistOfferEmail = ({
  eventTitle = "Hans Zimmer Live",
  venueName = "O2 Arena, London",
  seatCategory = "VIP",
  seatRow = "A",
  seatNumber = "12",
  price = 150,
  claimUrl = "http://localhost:3000/checkout/claim?token=demo",
  expiresInMinutes = 10,
}: WaitlistOfferEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#050810', color: '#f4f4f5', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ margin: '0 auto', padding: '40px 20px', maxWidth: '600px' }}>

          {/* Urgent Banner */}
          <Section style={{ backgroundColor: '#451a03', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
            <Text style={{ margin: 0, color: '#f59e0b', fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
              ⏰ A Seat Just Opened Up!
            </Text>
            <Text style={{ margin: '8px 0 0', color: '#fbbf24', fontSize: '14px' }}>
              You have {expiresInMinutes} minutes to claim your ticket before it goes to the next person.
            </Text>
          </Section>

          {/* Event Info */}
          <Section style={{ backgroundColor: '#0c111d', border: '1px solid #27272a', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '32px', backgroundImage: 'linear-gradient(to bottom, rgba(6, 182, 212, 0.1), transparent)' }}>
              <Text style={{ margin: 0, color: '#22d3ee', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Waitlist Offer
              </Text>
              <Text style={{ margin: '8px 0 0', color: '#ffffff', fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
                {eventTitle}
              </Text>
              <Text style={{ margin: '8px 0 0', color: '#a1a1aa', fontSize: '14px' }}>
                {venueName}
              </Text>
            </div>
          </Section>

          {/* Seat Details */}
          <Section style={{ backgroundColor: '#0c111d', border: '1px solid #27272a', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
            <Text style={{ margin: '0 0 16px', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
              Your Offered Seat
            </Text>
            <Row style={{ marginBottom: '8px' }}>
              <Column>
                <Text style={{ margin: 0, color: '#e4e4e7', fontSize: '16px', fontWeight: 'bold' }}>
                  Row {seatRow} - Seat {seatNumber}
                </Text>
                <Text style={{ margin: '4px 0 0', color: '#a1a1aa', fontSize: '12px' }}>
                  {seatCategory}
                </Text>
              </Column>
              <Column align="right">
                <Text style={{ margin: 0, color: '#10b981', fontSize: '20px', fontWeight: 'bold' }}>
                  ${price.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Claim Button */}
          <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
            <a
              href={claimUrl}
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                padding: '18px 40px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
                fontSize: '18px',
                boxShadow: '0 0 30px rgba(255,255,255,0.1)',
              }}
            >
              Claim Your Ticket Now →
            </a>
          </Section>

          {/* Warning */}
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ margin: 0, color: '#71717a', fontSize: '12px' }}>
              This offer expires in {expiresInMinutes} minutes. If you don&apos;t claim it, the seat will be offered to the next person on the waitlist.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistOfferEmail;
