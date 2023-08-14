import { styled } from 'styled-components'

import { CircleLink } from '@sdlgr/circle-link'

export const StyledCircleLink = styled(CircleLink)`
  display: none;

  ${({ theme }) => theme.media.up.md} {
    display: flex;
  }
`
