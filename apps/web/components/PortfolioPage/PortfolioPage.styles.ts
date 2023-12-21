import { VerticalScrollDirection } from 'react-use-is-scrolling'
import { keyframes, styled } from 'styled-components'

export const StyledContent = styled.div`
  margin-top: 60px;
  width: 100%;
  max-width: 1440px;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-bottom: 2rem;
  background-color: ${({ theme }) => theme.colors.black};
  display: flex;
  flex-direction: row;

  ${({ theme }) => theme.media.up.lg} {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`

export const StyledScrollColumn = styled.div<{ $active: boolean }>`
  display: none;
  filter: url(#fancy-goo);
  width: 12px;
  margin-left: -12px;
  z-index: 2;
  background-color: ${({ theme }) => theme.colors.white};
  opacity: 0;
  transition: opacity 0.15s ease-out;

  ${({ theme }) => theme.media.up.md} {
    display: block;
    opacity: ${({ $active }) => ($active ? 1 : 0)};
  }
`
export const StyledWrap = styled.div`
  margin-left: -8px;
  width: 100%;
`

const gelatineY = keyframes`
  from, to { scale: 1 1; }
  50% { scale: 1 1.1; }
`

const translateHelper = ($scrollingDirection: VerticalScrollDirection) => {
  const scrollMapper: Record<VerticalScrollDirection, number> = {
    down: -40,
    up: 40,
    none: 0,
  }

  return `translateY(${scrollMapper[$scrollingDirection]}px)`
}

export const StyledScrollButton = styled.button<{
  $isScrolling: boolean
  $scrollingDirection: VerticalScrollDirection
}>`
  position: sticky;
  top: calc(100vh - 100px);
  margin-bottom: 50px;
  height: 50px;
  width: 50px;
  background-color: ${({ theme }) => theme.colors.white};
  border-top-right-radius: 50%;
  border-bottom-right-radius: 50%;
  cursor: pointer;
  padding-block: 0;
  padding-inline: 0;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.colors.black};

  animation-name: ${({ $isScrolling }) => ($isScrolling ? gelatineY : '')};
  animation-duration: 0.5s;
  animation-iteration-count: infinite;

  transition: transform 0.3s ease-in-out;
  transform: ${({ $scrollingDirection }) =>
    translateHelper($scrollingDirection)};
`
