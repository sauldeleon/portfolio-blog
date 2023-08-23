import Image from 'next/image'
import styled from 'styled-components'

import { Body, Heading } from '@sdlgr/typography'

import { MainPortal } from '../MainPortal/MainPortal'

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

export const StyledContactInfo = styled.div`
  display: grid;
  place-items: center;
  rotate: 270deg;
  position: absolute;
  top: 36px;
  left: 65px;

  ${({ theme }) => theme.media.up.md} {
    position: unset;
    top: unset;
    left: unset;
    rotate: 0deg;
    row-gap: 13px;
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

export const StyledPortrait = styled(Image)`
  overflow: hidden;
  border-radius: 50%;
  width: 70px;
  height: 70px;

  ${({ theme }) => theme.media.up.md} {
    width: 140px;
    height: 140px;
  }
`
