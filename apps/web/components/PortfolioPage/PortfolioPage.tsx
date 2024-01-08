import { useEffect, useState } from 'react'
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
  StyledWrap,
} from './PortfolioPage.styles'
import { OtherStuff } from './components/OtherStuff/OtherStuff'
import { PortfolioHeading } from './components/PortfolioHeading/PortfolioHeading'
import { PortfolioItem } from './components/PortfolioItem/PortfolioItem'
import { ProfileInfo } from './components/ProfileInfo/ProfileInfo'
import { WorkingExperience } from './components/WorkingExperience/WorkingExperience'

export function PortfolioPage() {
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        style={{ display: 'none' }}
      >
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
      </svg>
      <StyledContent>
        <StyledScrollColumn $active={scroll > 0.1} data-testid="scrollColumn">
          <StyledScrollButton
            data-testid="scrollToTop"
            $isScrolling={isScrolling}
            $scrollingDirection={scrollDirectionY}
            onClick={() => window.scrollTo(0, 0)}
          >
            <ScrollTop height={18} />
          </StyledScrollButton>
        </StyledScrollColumn>
        <StyledWrap>
          <PortfolioHeading />
          <PortfolioItem title={t('items.profile.title')}>
            <ProfileInfo />
          </PortfolioItem>
          <PortfolioItem title={t('items.workingExperience')}>
            <WorkingExperience />
          </PortfolioItem>
          <PortfolioItem title={t('items.other.title')}>
            <OtherStuff />
          </PortfolioItem>
        </StyledWrap>
      </StyledContent>
      <StyledActionContainer>
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
          <StyledLabel>
            {t(isShared ? 'shared' : 'shareWithAFriend')}
          </StyledLabel>
        </StyledShareButton>
      </StyledActionContainer>
    </>
  )
}
