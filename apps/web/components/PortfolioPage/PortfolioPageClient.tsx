'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { useIsScrolling } from 'react-use-is-scrolling'

import { ScrollTop, ShareIcon } from '@sdlgr/assets'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledActionContainer,
  StyledContent,
  StyledLabel,
  StyledScrollButton,
  StyledScrollColumn,
  StyledShareButton,
  StyledSvgFilters,
  StyledWrap,
} from './PortfolioPage.styles'
import type { CvDocumentProps } from './components/CvDocument/CvDocument'

const DownloadCvButton = dynamic(
  () =>
    import('./components/DownloadCvButton/DownloadCvButton').then((m) => ({
      default: m.DownloadCvButton,
    })),
  { ssr: false },
)

interface PortfolioPageClientProps {
  children: React.ReactNode
  lng: string
  cvData: Omit<CvDocumentProps, 'photoUrl'>
  downloadLabel: string
  generatingLabel: string
  shareLabel: string
  sharedLabel: string
}

export function PortfolioPageClient({
  children,
  lng,
  cvData,
  downloadLabel,
  generatingLabel,
  shareLabel,
  sharedLabel,
}: PortfolioPageClientProps) {
  const { t } = useClientTranslation('portfolioPage')
  const [scroll, setScroll] = useState(0)
  const [isShared, setIsShared] = useState(false)
  const { isScrolling, scrollDirectionY } = useIsScrolling()

  useEffect(() => {
    const listener = () => {
      const scrollValue =
        window.scrollY / (document.body.offsetHeight - window.innerHeight)
      setScroll(scrollValue)
    }
    window.addEventListener('scroll', listener)
    return () => window.removeEventListener('scroll', listener)
  }, [])

  return (
    <>
      <StyledSvgFilters xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="fancy-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -14"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </StyledSvgFilters>
      <StyledContent>
        <StyledScrollColumn $active={scroll > 0.1} data-testid="scrollColumn">
          <StyledScrollButton
            data-testid="scrollToTop"
            aria-label={t('scrollToTop')}
            $isScrolling={isScrolling}
            $scrollingDirection={scrollDirectionY}
            onClick={() => window.scrollTo(0, 0)}
          >
            <ScrollTop height={18} aria-hidden="true" />
          </StyledScrollButton>
        </StyledScrollColumn>
        <StyledWrap>{children}</StyledWrap>
      </StyledContent>
      <StyledActionContainer>
        <DownloadCvButton
          lng={lng}
          cvData={cvData}
          photoPath="/assets/portrait-4.png"
          downloadLabel={downloadLabel}
          generatingLabel={generatingLabel}
          filename={`CV-SaulDeLeonGuerrero-${lng}.pdf`}
        />
        <StyledShareButton
          variant="contained"
          onClick={() => {
            navigator.clipboard.writeText(document.location.href)
            if (navigator.share !== undefined) {
              navigator.share({ url: document.location.href })
            }
            setIsShared(true)
          }}
        >
          <ShareIcon height={40} width={40} />
          <StyledLabel>{isShared ? sharedLabel : shareLabel}</StyledLabel>
        </StyledShareButton>
      </StyledActionContainer>
    </>
  )
}
