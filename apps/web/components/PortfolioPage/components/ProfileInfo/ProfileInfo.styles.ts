import { styled } from 'styled-components'

import { Body, Label } from '@sdlgr/typography'

export const StyledSummary = styled(Body)`
  font-size: 20px;

  ${({ theme }) => theme.media.up.lg} {
    font-size: 30px;
  }
`

export const StyledLabel = styled(Label)`
  margin-top: 40px;
`

export const StyledSkillGroup = styled.div`
  margin-top: 20px;
`

export const StyledSkillTitle = styled(Body)`
  font-weight: 500;
  display: flex;
  line-height: 20px;
  margin-bottom: 10px;

  svg {
    margin-right: 10px;
  }
`

export const StyledList = styled.ul`
  padding-left: 0px;

  ${({ theme }) => theme.media.up.lg} {
    padding-left: 25px;
  }
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

export const StyledItalic = styled.i`
  ${({ theme }) => theme.typography.body.M}
  font-size: 16px;
`
