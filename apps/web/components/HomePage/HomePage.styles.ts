import styled from 'styled-components'

import { Heading } from '@sdlgr/typography'

export const StyledHeading = styled(Heading)`
  margin-bottom: 30px;
  text-align: center;

  ${({ theme }) => theme.media.up.md} {
    ${({ theme }) => theme.typography.heading.heading1}
  }

  ${({ theme }) => theme.media.up.lg} {
    margin-bottom: 50px;
  }
`

export const StyledSubHeading = styled(Heading)`
  margin-top: 50px;
  margin-bottom: 50px;
`
