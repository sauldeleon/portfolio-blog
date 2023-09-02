import { styled } from 'styled-components'

import { Button } from '@sdlgr/button'
import { Body } from '@sdlgr/typography'

export const StyledButton = styled(Button)`
  color: ${({ theme }) => theme.colors.black};
  margin-right: 25px;
`

export const StyledBody = styled(Body)`
  color: ${({ theme }) => theme.colors.black};
`
