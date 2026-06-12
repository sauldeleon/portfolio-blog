import styled, { css, keyframes } from 'styled-components'

const pop = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.35); }
  100% { transform: scale(1); }
`

export const StyledLikeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const StyledLikeButton = styled.button<{ $liked: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: ${({ $liked }) => ($liked ? 'default' : 'pointer')};
  padding: 0;

  ${({ $liked }) =>
    $liked &&
    css`
      animation: ${pop} 0.3s ease;
    `}

  svg {
    width: 1rem;
    height: 1rem;
    transition:
      fill 0.2s,
      stroke 0.2s;
    fill: ${({ theme, $liked }) => ($liked ? theme.colors.orange : 'none')};
    stroke: ${({ theme, $liked }) =>
      $liked ? theme.colors.orange : `${theme.colors.white}99`};
    stroke-width: 2;
  }

  &:not(:disabled):hover svg {
    stroke: ${({ theme }) => theme.colors.orange};
  }
`

export const StyledLikeCount = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white}99;
`
