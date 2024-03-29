import { rgba } from 'polished'
import { styled } from 'styled-components'

import { CircleLink } from '@sdlgr/circle-link'
import { Body } from '@sdlgr/typography'

import { Portals } from '@web/components/Portals/Portals'

export const StyledSection = styled.section`
  max-width: 1440px;
  width: 100%;
  padding: 0 10px;
  margin-bottom: 90px;

  ${({ theme }) => theme.media.up.lg} {
    padding: 0 20px;
  }
`

export const StyledExperienceHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => rgba(theme.colors.white, 0.5)};
  margin-bottom: 40px;
  padding: 0 20px;

  ${({ theme }) => theme.media.up.md} {
    margin-bottom: 70px;
  }
`

export const StyledOrder = styled(Body)`
  font-size: 30px;
  ${({ theme }) => theme.fontStyles.robotoMono.light}

  ${({ theme }) => theme.media.up.lg} {
    font-size: 65px;
  }
`

export const StyledCompany = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;

  ${({ theme }) => theme.media.up.lg} {
    margin-bottom: 30px;
  }
`

export const StyledCompanyName = styled(Body)`
  font-size: 30px;
  text-align: end;
  ${({ theme }) => theme.fontStyles.robotoMono.medium};

  ${({ theme }) => theme.media.up.lg} {
    font-size: 65px;
    ${({ theme }) => theme.fontStyles.robotoMono.light};
  }
`

export const StyledCompanyPeriod = styled(Body)`
  font-size: 16px;
  ${({ theme }) => theme.fontStyles.robotoMono.thin};

  ${({ theme }) => theme.media.up.lg} {
    font-size: 30px;
  }
`

export const StyledExperienceInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
  align-items: center;

  ${({ theme }) => theme.media.up.md} {
    flex-direction: row;
    align-items: flex-start;
  }
`

export const StyledExperiencePortal = styled.div`
  width: 120%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;

  ${({ theme }) => theme.media.up.md} {
    width: 100%;
    margin-bottom: 0px;
    max-width: 45%;
  }
`

export const StyledExperienceDescription = styled.div`
  ${({ theme }) => theme.media.up.md} {
    padding: 0 20px;
    max-width: 55%;
    padding: 0;
  }
`

export const StyledDescriptionParagraph = styled(Body)`
  margin-bottom: 20px;
  font-size: 15px;

  ${({ theme }) => theme.media.up.md} {
    font-size: 20px;
  }
`

export const StyledCircleLink = styled(CircleLink)`
  margin-top: 50px;
  text-transform: uppercase;
  width: max-content;
`

export const StyledPortals = styled(Portals)`
  width: 100%;
  transform: unset;
  position: relative;

  ${({ theme }) => theme.media.up.md} {
    --iconHeight: 249px;
    --iconWidth: 130px;
    --pathHeight: 212px;
    --pathBorder: 30px 50%;

    margin: 70px 0 40px;
    min-width: 400px;
    width: 400px;
    transform: rotate(90deg);

    ${({ theme }) => theme.media.up.md} {
      --pathBorder: 30px 50%;
    }
  }
`

export const StyledTechnology = styled.b`
  ${({ theme }) => theme.typography.body.M}
  font-weight: bold;
`
