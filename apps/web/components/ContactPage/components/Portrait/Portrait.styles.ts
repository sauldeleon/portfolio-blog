import Image from 'next/image'
import styled, { Keyframes, css, keyframes } from 'styled-components'

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

const animationCache = new Map<string, Keyframes>()

const getAnimation = (index: number, total: number): Keyframes => {
  const key = `${index}-${total}`
  if (!animationCache.has(key)) {
    const slotSize = 100 / total
    const fadeInStart = index * slotSize
    const fadeInEnd = (index + 1) * slotSize
    const holdEnd = Math.min((index + 2) * slotSize, 100)
    const fadeOutEnd = Math.min((index + 3) * slotSize, 100)
    const isLast = holdEnd >= 100
    animationCache.set(
      key,
      isLast
        ? keyframes`${fadeInStart}% { opacity: 0; } ${fadeInEnd}% { opacity: 1; } 100% { opacity: 1; }`
        : keyframes`${fadeInStart}% { opacity: 0; } ${fadeInEnd}% { opacity: 1; } ${holdEnd}% { opacity: 1; } ${fadeOutEnd}% { opacity: 0; } 100% { opacity: 0; }`,
    )
  }
  return animationCache.get(key)!
}

const TIME_PER_IMAGE = 10
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
      animation: ${getAnimation($index - 1, $totalImages)}
        ${$totalImages * TIME_PER_IMAGE}s ${TIME_PER_IMAGE}s infinite;
    `}
`
