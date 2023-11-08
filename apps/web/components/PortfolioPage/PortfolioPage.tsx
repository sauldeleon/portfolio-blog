import { useEffect, useState } from 'react'
import { useIsScrolling } from 'react-use-is-scrolling'

import { ScrollTop } from '@sdlgr/assets'

import {
  StyledContent,
  StyledScrollButton,
  StyledScrollColumn,
  StyledWrap,
} from './PortfolioPage.styles'
import { PortfolioItem } from './components/ComponentItem/PortfolioItem'

export function PortfolioPage() {
  const [scroll, setScroll] = useState(0)
  const { isScrolling, scrollDirectionY } = useIsScrolling()
  console.log(scrollDirectionY)
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
          <PortfolioItem title="Potato"></PortfolioItem>
          <PortfolioItem title="Potato"></PortfolioItem>
          <PortfolioItem title="Potato"></PortfolioItem>
          <PortfolioItem title="Potato"></PortfolioItem>
          <PortfolioItem title="Potato"></PortfolioItem>
        </StyledWrap>
      </StyledContent>
    </>
  )
}
