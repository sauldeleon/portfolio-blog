import styled from 'styled-components'

import { CircleLink } from '@sdlgr/circle-link'

export const StyledCircleLink = styled(CircleLink)`
  margin-top: 40px;
  margin-bottom: 30px;

  ${({ theme }) => theme.media.up.md} {
    margin-bottom: 50px;
  }
`
