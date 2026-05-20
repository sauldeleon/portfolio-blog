'use client'

import { useState } from 'react'

import {
  CopyLinkIcon,
  EmailIcon,
  FacebookIcon,
  LinkedInIcon,
  TelegramIcon,
  WhatsAppIcon,
  XComIcon,
} from '@sdlgr/assets'
import { VisuallyHidden } from '@sdlgr/visually-hidden'

import {
  StyledCopyButton,
  StyledShareLink,
  StyledShareList,
  StyledShareWrapper,
} from './ShareButtons.styles'

export interface ShareButtonsProps {
  url: string
  title: string
  label?: string
  copyLinkLabel?: string
  copiedLabel?: string
}

const PLATFORMS = [
  {
    name: 'LinkedIn',
    Icon: LinkedInIcon,
    getHref: (url: string, title: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: 'X',
    Icon: XComIcon,
    getHref: (url: string, title: string) =>
      `https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'Facebook',
    Icon: FacebookIcon,
    getHref: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'WhatsApp',
    Icon: WhatsAppIcon,
    getHref: (url: string, title: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  {
    name: 'Telegram',
    Icon: TelegramIcon,
    getHref: (url: string, title: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: 'Email',
    Icon: EmailIcon,
    getHref: (url: string, title: string) =>
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
  },
] as const

export function ShareButtons({
  url,
  title,
  label,
  copyLinkLabel = 'Copy link',
  copiedLabel = 'Copied!',
}: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <StyledShareWrapper>
      {label && (
        <VisuallyHidden data-testid="share-label">{label}</VisuallyHidden>
      )}
      <StyledShareList>
        {PLATFORMS.map(({ name, Icon, getHref }) => (
          <li key={name}>
            <StyledShareLink
              href={getHref(url, title)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={name}
            >
              <Icon width={18} height={18} />
            </StyledShareLink>
          </li>
        ))}
        <li>
          <StyledCopyButton
            onClick={handleCopy}
            aria-label={copied ? copiedLabel : copyLinkLabel}
            title={copied ? copiedLabel : copyLinkLabel}
          >
            <CopyLinkIcon width={18} height={18} />
          </StyledCopyButton>
        </li>
      </StyledShareList>
    </StyledShareWrapper>
  )
}
