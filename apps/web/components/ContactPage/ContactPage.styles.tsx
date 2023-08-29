import styled, { css } from 'styled-components'

import { Body, Heading } from '@sdlgr/typography'

import { MainPortal } from '@web/components/MainPortal/MainPortal'

export const StyledMainPortal = styled(MainPortal)`
  margin-top: 30px;

  ${({ theme }) => theme.media.up.md} {
    margin-top: 166px;
  }
`

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
  opacity: 0;
  transition: opacity 2s ease-in;
  transform-origin: 50% 51%;

  ${({ $isVisible }) =>
    $isVisible &&
    css`
      opacity: 1;
    `}

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
