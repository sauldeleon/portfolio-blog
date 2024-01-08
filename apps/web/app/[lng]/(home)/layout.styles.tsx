import styled from 'styled-components'

import { CircleLink } from '@sdlgr/circle-link'
import { Body, Heading } from '@sdlgr/typography'

export const StyledContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 115px - 300px);
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  width: 100%;
`

export const StyledHeading = styled(Heading)`
  text-align: center;
  margin-top: 80px;

  ${({ theme }) => theme.media.up.md} {
    ${({ theme }) => theme.typography.heading.heading1}
  }

  ${({ theme }) => theme.media.up.lg} {
    margin-bottom: 10px;
  }
`

export const StyledSubHeading = styled(Heading)`
  margin-top: 30px;

  ${({ theme }) => theme.media.up.md} {
    margin-bottom: 40px;
    ${({ theme }) => theme.typography.heading.heading1}
  }
`

export const StyledCircleLink = styled(CircleLink)`
  margin-top: 40px;
  margin-bottom: 40px;

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
      ${({ theme }) => theme.typography.body.L}
    }
  }
`

export const StyledAttributes = styled.span`
  display: inline-block;
`

export const StyledAttribute = styled.span`
  display: inline;

  &:after {
    content: ' ';
    word-spacing: 1em;
    background-image: linear-gradient(
      0.25turn,
      transparent 0 calc(50% - 0.03em),
      currentcolor 0 calc(50% + 0.03em),
      transparent 0
    );
  }
`

export const StyledAttributeContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`
