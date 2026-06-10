import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
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
  coverImageStyle,
  footerSectionStyle,
  hrStyle,
  logoLinkStyle,
  smallTextStyle,
  unsubscribeLinkStyle,
} from './emailStyles'

export interface ConfirmSubscriptionEmailProps {
  name: string
  confirmUrl: string
  unsubscribeUrl: string
  siteUrl: string
  blogImageUrl?: string
  previewText: string
  heading: string
  body: string
  buttonLabel: string
  footerText: string
  unsubscribeText: string
}

export function ConfirmSubscriptionEmail({
  name,
  confirmUrl,
  unsubscribeUrl,
  siteUrl,
  blogImageUrl,
  previewText,
  heading,
  body,
  buttonLabel,
  footerText,
  unsubscribeText,
}: ConfirmSubscriptionEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Link href={siteUrl} style={logoLinkStyle}>
              sawl.dev
            </Link>
          </Section>

          <Section style={cardStyle}>
            {blogImageUrl && (
              <Img
                src={blogImageUrl}
                alt="sawl.dev"
                width="560"
                style={coverImageStyle}
              />
            )}

            <Section style={contentStyle}>
              <Heading style={headingStyle}>{heading}</Heading>
              <Text style={textStyle}>{body.replace('{{name}}', name)}</Text>

              <Button href={confirmUrl} style={buttonStyle}>
                {buttonLabel}
              </Button>

              <Text style={smallTextStyle}>{footerText}</Text>
            </Section>
          </Section>

          <Hr style={hrStyle} />

          <Section style={footerSectionStyle}>
            <Link href={unsubscribeUrl} style={unsubscribeLinkStyle}>
              {unsubscribeText}
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ConfirmSubscriptionEmail

const headerStyle: React.CSSProperties = {
  marginBottom: '32px',
}

const contentStyle: React.CSSProperties = {
  padding: '32px 40px 40px',
}

const headingStyle: React.CSSProperties = {
  color: '#FBFBFB',
  fontSize: '22px',
  fontWeight: '400',
  lineHeight: '1.4',
  margin: '0 0 16px',
}

const textStyle: React.CSSProperties = {
  color: 'rgba(251,251,251,0.75)',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 32px',
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#98DFD6',
  color: '#000000',
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  letterSpacing: '1.5px',
  padding: '14px 28px',
  textAlign: 'center',
  textDecoration: 'none',
  textTransform: 'uppercase',
  borderRadius: '2px',
  marginBottom: '32px',
}
