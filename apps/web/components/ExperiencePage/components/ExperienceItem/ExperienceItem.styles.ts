import { rgba } from 'polished'
import { styled } from 'styled-components'

import { CircleLink } from '@sdlgr/circle-link'
import { Body } from '@sdlgr/typography'

export const StyledSection = styled.section`
  max-width: 1440px;
  width: 100%;
  margin-bottom: 90px;
`

export const StyledExperienceHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => rgba(theme.colors.white, 0.5)};
  margin-bottom: 70px;
`

export const StyledOrder = styled(Body)`
  font-size: 65px;
  ${({ theme }) => theme.fontStyles.robotoMono.light}
`

export const StyledCompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

export const StyledCompanyName = styled(Body)`
  font-size: 65px;
  ${({ theme }) => theme.fontStyles.robotoMono.light};
  margin-bottom: 30px;
`

export const StyledCompanyPeriod = styled(Body)`
  font-size: 30px;
  ${({ theme }) => theme.fontStyles.robotoMono.thin};
`

export const StyledExperienceInfo = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
`

export const StyledExperiencePortal = styled.div`
  max-width: 45%;
  height: 400px;
  position: relative;
`

export const StyledExperienceDescription = styled.div`
  max-width: 55%;
`

export const StyledDescriptionParagraph = styled(Body)`
  margin-bottom: 20px;
`

export const StyledCircleLink = styled(CircleLink)`
  margin-top: 50px;
  text-transform: uppercase;
  width: max-content;
`
