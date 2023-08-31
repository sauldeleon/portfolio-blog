import styled from 'styled-components'

import { Body, Heading } from '@sdlgr/typography'

export const StyledContactInfoWrapper = styled.div`
  width: 100%;
  height: 100%;
`

export const StyledContactInfo = styled.div<{ $isVisible: boolean }>`
  display: grid;
  place-items: center;
  rotate: 270deg;
  position: absolute;
  top: 36px;
  left: 65px;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 2s ease-in;
  transform-origin: 50% 51%;

  ${({ theme }) => theme.media.up.md} {
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

export const StyledLabel = styled.span`
  display: inline-block;

  ${({ theme }) => theme.media.down.md} {
    display: none;
  }
`

export const StyledBody = styled(Body)`
  ${({ theme }) => theme.typography.body.XS};

  ${({ theme }) => theme.media.up.md} {
    ${({ theme }) => theme.typography.body.M};
  }
`
