import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import type { TemplateEntry } from './registry'

export interface CommunityWelcomeProps {
  headline?: string
  body?: string
  ctaLabel?: string | null
  ctaUrl?: string | null
  siteName?: string
  logoUrl?: string | null
}

export const CommunityWelcomeEmail = ({
  headline = "You're on the list",
  body = "Thanks for joining the community list for The Indie Book Table. We're building a home for indie authors, and you'll be among the first to hear when we open the doors.",
  ctaLabel,
  ctaUrl,
  siteName = 'The Indie Book Table',
  logoUrl,
}: CommunityWelcomeProps) => {
  const paragraphs = String(body ?? '')
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean)

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{headline}</Preview>
      <Body style={main}>
        <Container style={container}>
          {logoUrl ? (
            <Section style={logoRow}>
              <Img src={logoUrl} alt={siteName} width="140" style={logo} />
            </Section>
          ) : null}
          <Heading style={h1}>{headline}</Heading>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={text}>
              {paragraph}
            </Text>
          ))}
          {ctaLabel && ctaUrl ? (
            <Button style={button} href={ctaUrl}>
              {ctaLabel}
            </Button>
          ) : null}
          <Text style={footer}>
            You're getting this because you joined the community list at {siteName}.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CommunityWelcomeEmail,
  subject: (data: Record<string, any>) =>
    data['subject'] ?? "You're on the list — The Indie Book Table",
  displayName: 'Community list welcome',
  previewData: {
    headline: "You're on the list",
    body: "Thanks for joining the community list for The Indie Book Table.\n\nWe're building a home for indie authors, and you'll be among the first to hear when we open the doors.",
    ctaLabel: 'Visit the site',
    ctaUrl: 'https://indiebooktable.com',
    logoUrl: 'https://indiebooktable.com/api/public/email-asset/default-logo.png',
  },
} satisfies TemplateEntry

export default CommunityWelcomeEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const logoRow = { textAlign: 'center' as const, margin: '8px 0 24px' }
const logo = { display: 'inline-block', maxWidth: '140px', height: 'auto' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'normal' as const,
  color: '#1b1a18',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#3f3d3a',
  lineHeight: '1.6',
  margin: '0 0 18px',
  fontFamily: 'Arial, sans-serif',
}
const button = {
  backgroundColor: '#1b1a18',
  color: '#ffffff',
  fontSize: '14px',
  fontFamily: 'Arial, sans-serif',
  border: '1px solid #1b1a18',
  borderRadius: '10px',
  padding: '12px 20px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = {
  fontSize: '12px',
  color: '#9a948c',
  margin: '32px 0 0',
  fontFamily: 'Arial, sans-serif',
}
