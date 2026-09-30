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

interface SubmissionStatusUpdateProps {
  siteName?: string
  bookTitle?: string
  statusLabel?: string
  submissionUrl?: string
}

export const SubmissionStatusUpdateEmail = ({
  siteName = 'The Indie Table',
  bookTitle = 'Your book',
  statusLabel = 'Under review',
  submissionUrl = '#',
}: SubmissionStatusUpdateProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      “{bookTitle}” is now {statusLabel}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your submission was updated</Heading>
        <Text style={text}>
          <strong>“{bookTitle}”</strong> is now <strong>{statusLabel}</strong> on {siteName}.
        </Text>
        <Button style={button} href={submissionUrl}>
          See your submission
        </Button>
        <Text style={footer}>
          You're getting this because you submitted this book to {siteName}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SubmissionStatusUpdateEmail,
  subject: (data: Record<string, any>) =>
    `“${data['bookTitle'] ?? 'Your book'}” is now ${data['statusLabel'] ?? 'updated'}`,
  displayName: 'Submission status update',
  previewData: {
    siteName: 'The Indie Table',
    bookTitle: 'Notes on Small Rooms',
    statusLabel: 'Added to the database',
    submissionUrl: 'https://example.com/submissions',
  },
} satisfies TemplateEntry

export default SubmissionStatusUpdateEmail

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
