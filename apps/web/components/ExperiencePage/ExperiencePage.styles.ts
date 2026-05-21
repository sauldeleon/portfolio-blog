import { rgba } from 'polished'
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

export const StyledNavWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.black};
  border-bottom: 1px solid ${({ theme }) => rgba(theme.colors.white, 0.1)};
  margin-bottom: 20px;

  & nav {
    padding: 0.5rem 10px;
    border: none;
    max-width: 1440px;
    margin: 0 auto;
  }

  & p {
    display: none;
  }

  & ol {
    flex-direction: row;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    gap: 0;
  }

  & ol::-webkit-scrollbar {
    display: none;
  }

  & li {
    flex-shrink: 0;
  }

  & a {
    white-space: nowrap;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  ${({ theme }) => theme.media.up.lg} {
    & nav {
      padding: 0.5rem 20px;
    }

    & a {
      padding: 0.5rem 1rem;
      font-size: 0.9375rem;
    }
  }
`
