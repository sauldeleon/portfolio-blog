import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

import {
  bodyStyle,
  cardStyle,
  containerStyle,
  footerSectionStyle,
  hrStyle,
  logoLinkStyle,
  smallTextStyle,
} from './emailStyles'

export interface NewCommentEmailProps {
  username: string
  body: string
  postTitle: string
  postUrl: string
  adminUrl: string
  siteUrl: string
}

export function NewCommentEmail({
  username,
  body,
  postTitle,
  postUrl,
  adminUrl,
  siteUrl,
}: NewCommentEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>
        New comment from {username} on &quot;{postTitle}&quot;
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Link href={siteUrl} style={logoLinkStyle}>
            sawl.dev
          </Link>
          <Hr style={hrStyle} />
          <Section style={cardStyle}>
            <Section style={{ padding: '24px' }}>
              <Heading
                style={{
                  color: '#FBFBFB',
                  fontSize: '20px',
                  fontWeight: 500,
                  margin: '0 0 8px',
                }}
              >
                New comment pending moderation
              </Heading>
              <Text
                style={{
                  color: '#98DFD6',
                  fontSize: '14px',
                  margin: '0 0 16px',
                }}
              >
                <Link href={postUrl} style={{ color: '#98DFD6' }}>
                  {postTitle}
                </Link>
              </Text>
              <Text
                style={{
                  color: '#FBFBFB',
                  fontSize: '13px',
                  margin: '0 0 4px',
                }}
              >
                <strong>From:</strong> {username}
              </Text>
              <Text
                style={{
                  color: '#FBFBFB',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  backgroundColor: '#111111',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  border: '1px solid #222222',
                  margin: '8px 0 0',
                }}
              >
                {body}
              </Text>
            </Section>
          </Section>
          <Hr style={hrStyle} />
          <Section style={footerSectionStyle}>
            <Text style={smallTextStyle}>
              <Link
                href={adminUrl}
                style={{ color: '#98DFD6', fontSize: '13px' }}
              >
                Review in admin →
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
