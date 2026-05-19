import styled, { css } from 'styled-components'

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
