import { styled } from 'styled-components'

import { Link } from '@sdlgr/link'
import { Label } from '@sdlgr/typography'

export const StyledAreaPeriod = styled(Label)`
  font-size: 20px;
  margin-bottom: 20px;
  ${({ theme }) => theme.fontStyles.robotoMono.regular};
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

export const StyledItalic = styled.i`
  ${({ theme }) => theme.typography.body.M}
`

export const StyledLink = styled(Link)`
  font-weight: bold;
`
