import Image from 'next/image'
import { css, keyframes, styled } from 'styled-components'

export const StyledPortraitContainer = styled.div`
  position: relative;
  width: 70px;
  height: 70px;

  ${({ theme }) => theme.media.up.md} {
    width: 140px;
    height: 140px;
  }
`

export const portraitStyles = css`
  overflow: hidden;
  border-radius: 50%;
  width: 70px;
  height: 70px;

  ${({ theme }) => theme.media.up.md} {
    width: 140px;
    height: 140px;
  }
`

const generateAnimation = (index: number, total: number) =>
  keyframes`
  ${css`
    ${(index / total) * 100}% {
      opacity: 0;
    }
    ${((index + 1) / total) * 100}% {
      opacity: 1;
    }
  `}
     
  `

export const StyledPortrait = styled(Image)<{
  $index: number
  $totalImages: number
}>`
  ${portraitStyles};
  position: absolute;
  opacity: ${({ $index }) => ($index === 0 ? 1 : 0)};

  ${({ $index, $totalImages }) =>
    $index > 0 &&
    css`
      animation: ${generateAnimation($index, $totalImages + 1)}
        ${($totalImages - 1) * 5}s infinite;
    `}
`
