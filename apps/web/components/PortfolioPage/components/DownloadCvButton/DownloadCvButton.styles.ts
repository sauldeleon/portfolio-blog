import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledDownloadButton = styled(Button)`
  padding: 10px;
  width: 100%;
  gap: 12px;

  ${({ theme }) => theme.media.up.md} {
    width: fit-content;
    padding: 15px 20px;
  }
`
