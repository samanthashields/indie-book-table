import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

import type { TemplateEntry } from './registry'

interface NewSubmissionAlertProps {
  siteName?: string
  bookTitle?: string
  reviewUrl?: string
}

export const NewSubmissionAlertEmail = ({
  siteName = 'The Indie Table',
  bookTitle = 'A new book',
  reviewUrl = '#',
}: NewSubmissionAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New submission: {bookTitle}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>A new book is waiting for review</Heading>
        <Text style={text}>
          <strong>“{bookTitle}”</strong> was just submitted to {siteName}.
        </Text>
        <Button style={button} href={reviewUrl}>
          Review it
        </Button>
        <Text style={footer}>You're getting this because you're an editor on {siteName}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NewSubmissionAlertEmail,
  subject: (data: Record<string, any>) => `New submission: ${data['bookTitle'] ?? 'A new book'}`,
  displayName: 'New submission alert',
  previewData: {
    siteName: 'The Indie Table',
    bookTitle: 'Notes on Small Rooms',
    reviewUrl: 'https://example.com/admin/submissions',
  },
} satisfies TemplateEntry

export default NewSubmissionAlertEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#000000',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  fontSize: '14px',
  border: '1px solid #000000',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
