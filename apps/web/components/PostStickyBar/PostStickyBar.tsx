'use client'

import { useRouter } from 'next/navigation'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { LanguageIcon, ScrollTop as ScrollTopIcon } from '@sdlgr/assets'
import { STORAGE_I18N_KEY } from '@sdlgr/i18n-config'
import { LanguageContext } from '@sdlgr/i18n-tools'
import { ShareButtons } from '@sdlgr/post-hero'
import { LocalStorage, useStorage } from '@sdlgr/storage'

import { getNextLanguage } from '@web/i18n/client'

import {
  StyledActionsDivider,
  StyledBar,
  StyledBarInner,
  StyledLangButton,
  StyledNavActions,
  StyledScrollTopButton,
  StyledSentinel,
  StyledShareSection,
  StyledTitle,
} from './PostStickyBar.styles'

export interface PostStickyBarProps {
  title: string
  url: string
  altLangPath: string
  altLangLabel: string
  altLangAriaLabel: string
  scrollTopAriaLabel?: string
  copyLinkLabel?: string
  copiedLabel?: string
}

export function PostStickyBar({
  title,
  url,
  altLangPath,
  altLangLabel,
  altLangAriaLabel,
  scrollTopAriaLabel = 'Back to top',
  copyLinkLabel,
  copiedLabel,
}: PostStickyBarProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const router = useRouter()
  const { language } = useContext(LanguageContext)
  const storage = useMemo(() => new LocalStorage(), [])
  const [, setItem] = useStorage(storage)
  const nextLanguage = getNextLanguage(language)

  useEffect(() => {
    const sentinel = sentinelRef.current
    /* istanbul ignore next */
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const handleLangSwitch = () => {
    setItem(STORAGE_I18N_KEY, nextLanguage)
    router.push(altLangPath)
  }

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <StyledSentinel
        ref={sentinelRef}
        aria-hidden="true"
        data-testid="sticky-bar-sentinel"
      />
      <StyledBar
        $visible={visible}
        aria-hidden={!visible}
        data-testid="sticky-bar"
      >
        <StyledBarInner>
          <StyledTitle>{title}</StyledTitle>
          <StyledShareSection>
            <ShareButtons
              url={url}
              title={title}
              copyLinkLabel={copyLinkLabel}
              copiedLabel={copiedLabel}
            />
          </StyledShareSection>
          <StyledNavActions>
            <StyledActionsDivider
              aria-hidden="true"
              data-testid="actions-divider"
            />
            <StyledLangButton
              onClick={handleLangSwitch}
              aria-label={altLangAriaLabel}
              data-testid="lang-switch-button"
            >
              <LanguageIcon width={16} height={16} aria-hidden="true" />
              {altLangLabel}
            </StyledLangButton>
            <StyledScrollTopButton
              onClick={handleScrollTop}
              aria-label={scrollTopAriaLabel}
              data-testid="scroll-top-button"
            >
              <ScrollTopIcon width={16} height={16} aria-hidden="true" />
            </StyledScrollTopButton>
          </StyledNavActions>
        </StyledBarInner>
      </StyledBar>
    </>
  )
}
