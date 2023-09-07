import styled from 'styled-components'

import { Link } from '@sdlgr/link'
import { Body, Heading } from '@sdlgr/typography'

export const StyledContactInfoWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
`

export const StyledContactInfo = styled.div<{ $isVisible: boolean }>`
  display: grid;
  place-items: center;
  rotate: 270deg;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 2s ease-in;
  transform-origin: 50% 51.7%;
  margin-bottom: 5px;
  row-gap: 4px;

  ${({ theme }) => theme.media.up.md} {
    width: 100%;
    height: 100%;
    margin-bottom: 0px;
    position: unset;
    top: unset;
    left: unset;
    rotate: 0deg;
    row-gap: 10px;
  }
`

export const StyledHeading = styled(Heading)`
  ${({ theme }) => theme.typography.body.M};

  ${({ theme }) => theme.media.up.md} {
    ${({ theme }) => theme.typography.heading.heading2};
  }
`

export const StyledBody = styled(Body)`
  display: flex;
  align-items: center;

  ${({ theme }) => theme.typography.body.XS};

  ${({ theme }) => theme.media.up.md} {
    ${({ theme }) => theme.typography.body.M};
  }
`

export const StyledLink = styled(Link)``

export const StyledIconWrapper = styled.span`
  display: grid;
  place-items: center;
  margin-right: 4px;

  svg {
    width: 12px;
    height: 12px;
  }

  ${({ theme }) => theme.media.up.md} {
    margin-right: 8px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`
