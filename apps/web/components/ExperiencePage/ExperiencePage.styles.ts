import { Heading } from '@sdlgr/typography'
import { styled } from 'styled-components'

export const StyledHeading = styled(Heading)`
  text-align: center;
  margin-top: 80px;

  ${({ theme }) => theme.media.up.md} {
    ${({ theme }) => theme.typography.heading.heading1}
  }

  ${({ theme }) => theme.media.up.lg} {
    margin-bottom: 50px;
  }
`
