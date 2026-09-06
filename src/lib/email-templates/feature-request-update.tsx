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

interface FeatureRequestUpdateProps {
  siteName?: string
  requestTitle?: string
  statusLabel?: string
  publicNote?: string | null
  requestUrl?: string
}

export const FeatureRequestUpdateEmail = ({
  siteName = "Author's Workshop",
  requestTitle = 'Your feature request',
  statusLabel = 'Under consideration',
  publicNote,
  requestUrl = '#',
}: FeatureRequestUpdateProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      “{requestTitle}” is now {statusLabel}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Feature request update</Heading>
        <Text style={text}>
          <strong>“{requestTitle}”</strong> is now <strong>{statusLabel}</strong>.
        </Text>
        {publicNote ? <Text style={note}>{publicNote}</Text> : null}
        <Button style={button} href={requestUrl}>
          See the request
        </Button>
        <Text style={footer}>
          You're getting this because you submitted or voted for this request on {siteName}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FeatureRequestUpdateEmail,
  subject: (data: Record<string, any>) =>
    `“${data.requestTitle ?? 'Your feature request'}” is now ${data.statusLabel ?? 'updated'}`,
  displayName: 'Feature request update',
  previewData: {
    siteName: "Author's Workshop",
    requestTitle: 'Dark mode for the editor',
    statusLabel: 'Planned',
    publicNote: 'We’ve added this to the next cycle. Thanks for the suggestion!',
    requestUrl: 'https://example.com/help/requests/123',
  },
} satisfies TemplateEntry

export default FeatureRequestUpdateEmail

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
const note = {
  fontSize: '14px',
  color: '#333333',
  lineHeight: '1.5',
  margin: '0 0 25px',
  padding: '12px 16px',
  backgroundColor: '#f5f5f4',
  borderRadius: '8px',
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
