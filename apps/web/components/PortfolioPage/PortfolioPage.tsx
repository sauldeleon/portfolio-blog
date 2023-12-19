import { useEffect, useState } from 'react'
import { useIsScrolling } from 'react-use-is-scrolling'

import { ScrollTop } from '@sdlgr/assets'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledContent,
  StyledScrollButton,
  StyledScrollColumn,
  StyledWrap,
} from './PortfolioPage.styles'
import { OtherSfuff } from './components/OtherSfuff/OtherSfuff'
import { PortfolioHeading } from './components/PortfolioHeading/PortfolioHeading'
import { PortfolioItem } from './components/PortfolioItem/PortfolioItem'
import { ProfileInfo } from './components/ProfileInfo/ProfileInfo'
import { WorkingExperience } from './components/WorkingExperience/WorkingExperience'

export function PortfolioPage() {
  const { t } = useClientTranslation('portfolioPage')
  const [scroll, setScroll] = useState(0)
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
        <StyledScrollColumn $active={scroll > 0.1}>
          <StyledScrollButton
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
          <PortfolioItem title={t('items.other')}>
            <OtherSfuff />
          </PortfolioItem>
        </StyledWrap>
      </StyledContent>
    </>
  )
}
