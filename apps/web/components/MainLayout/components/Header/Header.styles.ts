import styled from 'styled-components'

import { SLLogo } from '@sdlgr/assets'
import { CircleLink } from '@sdlgr/circle-link'
import { Link } from '@sdlgr/link'

export const StyledLogoLink = styled(Link)`
  display: flex;
  margin-right: 15px;

  ${({ theme }) => theme.helpers.textBottomBorder.removeAfter};
`

export const StyledSLLogo = styled(SLLogo)`
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: 25px;
  width: 89px;

  ${({ theme }) => theme.media.up.md} {
    width: 106px;
    color: ${({ theme }) => theme.colors.white};
    margin-bottom: 0;
  }
`

export const StyledCircleLink = styled(CircleLink)`
  display: none;

  ${({ theme }) => theme.media.up.md} {
    margin: 0 20px;
    display: flex;
  }
`
