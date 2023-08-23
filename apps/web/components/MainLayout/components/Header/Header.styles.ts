import Link from 'next/link'
import styled from 'styled-components'

import { SLLogo } from '@sdlgr/assets'
import { CircleLink } from '@sdlgr/circle-link'

export const StyledLogoLink = styled(Link)`
  display: flex;
`

export const StyledSLLogo = styled(SLLogo)`
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 25px;

  ${({ theme }) => theme.media.up.md} {
    color: ${({ theme }) => theme.colors.white};
    margin-bottom: 0;
  }
`

export const StyledCircleLink = styled(CircleLink)`
  display: none;

  ${({ theme }) => theme.media.up.md} {
    display: flex;
  }
`
