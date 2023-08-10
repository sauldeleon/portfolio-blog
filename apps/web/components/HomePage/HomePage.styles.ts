import styled from 'styled-components'

import { Heading } from '@sdlgr/typography'

export const StyledPage = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

export const StyledHeading = styled(Heading)`
  margin-bottom: 50px;
`
