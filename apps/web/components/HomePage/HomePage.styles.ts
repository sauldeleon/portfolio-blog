import styled from 'styled-components'

import { CircleLink } from '@sdlgr/circle-link'
import { Body, Heading } from '@sdlgr/typography'

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
  margin-top: 30px;

  ${({ theme }) => theme.media.up.md} {
    margin-bottom: 40px;
  }
`

export const StyledCircleLink = styled(CircleLink)`
  margin-bottom: 30px;

  ${({ theme }) => theme.media.up.md} {
    margin-bottom: 50px;
  }
`

export const StyledSummary = styled.section`
  text-align: center;
  max-width: 1180px;
  padding: 0 34px;

  ${Body} {
    margin-top: 20px;
  }

  ${({ theme }) => theme.media.up.md} {
    ${Body} {
      ${({ theme }) => theme.typography.body.M}
    }
  }
`
