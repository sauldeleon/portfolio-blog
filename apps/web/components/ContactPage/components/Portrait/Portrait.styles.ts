import Image from 'next/image'
import { styled } from 'styled-components'

export const StyledPortrait = styled(Image)`
  overflow: hidden;
  border-radius: 50%;
  width: 70px;
  height: 70px;

  ${({ theme }) => theme.media.up.md} {
    width: 140px;
    height: 140px;
  }
`
