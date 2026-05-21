import styled, { css, keyframes } from 'styled-components'

export const StyledShareWrapper = styled.div`
  display: flex;
  align-items: center;
`

export const StyledShareList = styled.ul`
  display: flex;
  gap: 0.1rem;
  list-style: none;
  padding: 0;
  margin: 0;
`

const shareButtonStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: currentColor;
  transition: opacity 0.2s ease;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: none;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`

export const StyledShareLink = styled.a`
  ${shareButtonStyles}
`

export const StyledCopyButton = styled.button`
  ${shareButtonStyles}
`

export const StyledCopyItem = styled.li`
  position: relative;
`

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
`

export const StyledCopiedPill = styled.span`
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.colors.blue};
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  pointer-events: none;
  animation: ${fadeInUp} 0.18s ease;
`
