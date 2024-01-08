import Image from 'next/image'
import { styled } from 'styled-components'

import { Body, Heading, Label } from '@sdlgr/typography'

export const StyledSection = styled.section`
  border: 3px solid ${({ theme }) => theme.colors.white};
  border-bottom: none;
  padding: 1rem;
  width: 100%;
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.up.lg} {
    padding: 3rem;
  }
`

export const StyledRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-start;
`

export const StyledDegree = styled(Label)`
  font-size: 16px;
  margin-bottom: 20px;
  width: 100%;

  ${({ theme }) => theme.media.up.md} {
    font-size: 20px;
  }
`

export const StyledFirstRow = styled(StyledRow)`
  flex-direction: column-reverse;
  font-size: 16px;

  ${({ theme }) => theme.media.up.md} {
    flex-direction: row;
    font-size: 20px;
  }
`

export const StyledInfo = styled.div`
  text-transform: uppercase;
  margin-bottom: 30px;
  width: 100%;
  text-align: right;

  ${({ theme }) => theme.media.up.md} {
    margin-bottom: 50px;
  }
`

export const StyledBody = styled(Body)`
  font-size: 16px;

  ${({ theme }) => theme.media.up.lg} {
    font-size: 20px;
  }
`

export const StyledPortrait = styled(Image)`
  overflow: hidden;
  border-radius: 50%;
  width: 60px;
  min-width: 60px;
  height: 60px;

  ${({ theme }) => theme.media.up.md} {
    width: 180px;
    min-width: 180px;
    height: 180px;
  }

  ${({ theme }) => theme.media.up.lg} {
    width: 310px;
    min-width: 310px;
    height: 310px;
  }
`

export const StyledHeading = styled(Heading)`
  margin-top: 25px;
  margin-left: 20px;
  font-size: 1.5rem;
  font-weight: 500;

  ${({ theme }) => theme.media.up.md} {
    margin-top: 40px;
    margin-top: 100px;
    margin-left: 40px;
    font-size: 3rem;
    font-weight: 500;
  }

  ${({ theme }) => theme.media.up.lg} {
    margin-top: 160px;
    margin-left: 80px;
    font-size: 4rem;
    font-weight: 500;
  }
`
