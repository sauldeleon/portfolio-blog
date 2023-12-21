import { styled } from 'styled-components'

import { Heading, Label } from '@sdlgr/typography'

export const StyledCompanyName = styled(Heading)`
  ${({ theme }) => theme.fontStyles.robotoMono.medium};
  font-size: 20px;
  margin-bottom: 30px;

  ${({ theme }) => theme.media.up.lg} {
    font-size: 30px;
  }
`

export const StyledCompanyPeriod = styled(Label)`
  font-size: 16px;
  margin-bottom: 20px;
  ${({ theme }) => theme.fontStyles.robotoMono.regular};

  ${({ theme }) => theme.media.up.lg} {
    font-size: 20px;
  }
`

export const StyledList = styled.ul`
  margin-bottom: 50px;
`

export const StyledListItem = styled.li`
  font-size: 16px;
  text-indent: -20px;
  padding-left: 20px;

  &:before {
    content: '·';
    font-size: 30px;
    vertical-align: middle;
    line-height: 20px;
  }
`

export const StyledTechnology = styled.b`
  ${({ theme }) => theme.typography.body.M}
  font-size: 16px;
  font-weight: bold;
`
