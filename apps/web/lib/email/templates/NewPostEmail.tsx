import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

export interface NewPostEmailProps {
  postTitle: string
  postExcerpt: string
  postUrl: string
  unsubscribeUrl: string
  siteUrl: string
  previewText: string
  teaser: string
  heading: string
  buttonLabel: string
  footerText: string
  unsubscribeText: string
  coverImageUrl?: string
  category?: string
  tags?: string[]
  seriesTitle?: string
  seriesOrder?: number | null
}

export function NewPostEmail({
  postTitle,
  postExcerpt,
  postUrl,
  unsubscribeUrl,
  siteUrl,
  previewText,
  teaser,
  heading,
  buttonLabel,
  footerText,
  unsubscribeText,
  coverImageUrl,
  category,
  tags,
  seriesTitle,
  seriesOrder,
}: NewPostEmailProps) {
  const seriesParts = [
    seriesOrder != null ? `PART ${seriesOrder}` : null,
    seriesTitle ? seriesTitle.toUpperCase() : null,
  ].filter(Boolean)
  const seriesLine = seriesParts.join(' · ')

  const visibleTags = tags ? tags.slice(0, 3) : []

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

          <Section style={teaserSectionStyle}>
            <Text style={teaserLineStyle}>— {teaser} —</Text>
          </Section>

          <Section style={cardStyle}>
            {coverImageUrl && (
              <Img
                src={coverImageUrl}
                alt={postTitle}
                width="560"
                style={coverImageStyle}
              />
            )}

            <Section style={contentStyle}>
              <Text style={labelStyle}>{heading}</Text>

              {category && (
                <Text style={categoryStyle}>{category.toUpperCase()}</Text>
              )}

              {seriesLine ? (
                <Text style={seriesStyle}>{seriesLine}</Text>
              ) : null}

              <Heading style={headingStyle}>{postTitle}</Heading>
              <Text style={textStyle}>{postExcerpt}</Text>

              {visibleTags.length > 0 && (
                <Row style={tagsRowStyle}>
                  {visibleTags.map((tag) => (
                    <Column key={tag} style={tagColumnStyle}>
                      <Text style={tagStyle}>#{tag}</Text>
                    </Column>
                  ))}
                  <Column style={{ width: '100%' }} />
                </Row>
              )}

              <Button href={postUrl} style={buttonStyle}>
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

export default NewPostEmail

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#000000',
  fontFamily: '"Roboto Mono", "Courier New", Courier, monospace',
  margin: '0',
  padding: '0',
}

const containerStyle: React.CSSProperties = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 24px',
}

const headerStyle: React.CSSProperties = {
  marginBottom: '24px',
}

const logoLinkStyle: React.CSSProperties = {
  color: '#98DFD6',
  fontSize: '24px',
  fontWeight: '500',
  textDecoration: 'none',
  letterSpacing: '2px',
}

const teaserSectionStyle: React.CSSProperties = {
  marginBottom: '24px',
  textAlign: 'center',
}

const teaserLineStyle: React.CSSProperties = {
  color: 'rgba(251,251,251,0.55)',
  fontSize: '13px',
  fontWeight: '400',
  letterSpacing: '1.5px',
  margin: '0',
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#0a0a0a',
  border: '1px solid #222222',
  borderRadius: '4px',
  overflow: 'hidden',
}

const coverImageStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  maxWidth: '100%',
}

const contentStyle: React.CSSProperties = {
  padding: '28px 36px 36px',
}

const labelStyle: React.CSSProperties = {
  color: '#98DFD6',
  fontSize: '10px',
  fontWeight: '500',
  letterSpacing: '2.5px',
  textTransform: 'uppercase',
  margin: '0 0 12px',
}

const categoryStyle: React.CSSProperties = {
  display: 'inline-block',
  color: '#98DFD6',
  fontSize: '10px',
  fontWeight: '500',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
}

const seriesStyle: React.CSSProperties = {
  color: 'rgba(255,221,131,0.75)',
  fontSize: '10px',
  fontWeight: '500',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  margin: '0 0 16px',
}

const headingStyle: React.CSSProperties = {
  color: '#FBFBFB',
  fontSize: '22px',
  fontWeight: '400',
  lineHeight: '1.35',
  margin: '0 0 14px',
}

const textStyle: React.CSSProperties = {
  color: 'rgba(251,251,251,0.65)',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const tagsRowStyle: React.CSSProperties = {
  marginBottom: '28px',
}

const tagColumnStyle: React.CSSProperties = {
  paddingRight: '8px',
  width: '1%',
  whiteSpace: 'nowrap',
}

const tagStyle: React.CSSProperties = {
  display: 'inline-block',
  border: '1px solid #98DFD6',
  color: '#98DFD6',
  fontSize: '10px',
  fontWeight: '500',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  padding: '2px 7px',
  margin: '0',
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#98DFD6',
  color: '#000000',
  display: 'block',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '2px',
  padding: '13px 28px',
  textAlign: 'center',
  textDecoration: 'none',
  textTransform: 'uppercase',
  borderRadius: '2px',
  marginBottom: '28px',
}

const smallTextStyle: React.CSSProperties = {
  color: '#555555',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0',
}

const hrStyle: React.CSSProperties = {
  borderColor: '#1a1a1a',
  margin: '24px 0',
}

const footerSectionStyle: React.CSSProperties = {
  textAlign: 'center',
}

const unsubscribeLinkStyle: React.CSSProperties = {
  color: '#555555',
  fontSize: '12px',
  textDecoration: 'underline',
}
