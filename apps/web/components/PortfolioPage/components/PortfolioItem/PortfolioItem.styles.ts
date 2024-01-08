import { styled } from 'styled-components'

import { Label } from '@sdlgr/typography'

export const StyledSection = styled.section`
  position: relative;
  border: 3px solid ${({ theme }) => theme.colors.white};
  border-bottom: none;
  padding: 1rem;
  width: 100%;
  min-height: 700px;
  display: flex;
  flex-direction: column;

  &:last-child {
    border-bottom: 3px solid ${({ theme }) => theme.colors.white};
  }

  ${({ theme }) => theme.media.up.lg} {
    flex-direction: row;
    justify-content: space-between;
    padding: 3rem;
  }
`

export const StyledTitle = styled(Label)`
  margin-bottom: 20px;

  ${({ theme }) => theme.media.up.lg} {
    margin-bottom: 0px;
  }
`

export const StyledContainer = styled.div`
  width: 100%;
  padding: 0px;

  ${({ theme }) => theme.media.up.lg} {
    padding: 0px 20px;
    max-width: 900px;
  }
`
