import { styled } from 'styled-components'

import { Heading } from '@sdlgr/typography'

export const StyledHeading = styled(Heading)`
  text-align: center;
  margin-top: 40px;
  margin-bottom: 40px;

  ${({ theme }) => theme.media.up.lg} {
    ${({ theme }) => theme.typography.heading.heading1}
    margin-top: 80px;
    margin-bottom: 50px;
  }
`
