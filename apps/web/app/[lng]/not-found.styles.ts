import styled, { keyframes } from 'styled-components'

const glitch = keyframes`
  2%,64%{
    transform: translate(2px,0) skew(0deg);
  }
  4%,60%{
    transform: translate(-2px,0) skew(0deg);
  }
  62%{
    transform: translate(0,0) skew(5deg); 
  }
`

const glitchTop = keyframes`
  2%,64%{
    transform: translate(2px,-2px);
  }
  4%,60%{
    transform: translate(-2px,2px);
  }
  62%{
    transform: translate(13px,-1px) skew(-13deg); 
  }
`

const glitchBotom = keyframes`
  2%,64%{
    transform: translate(-2px,0);
  }
  4%,60%{
    transform: translate(-2px,0);
  }
  62%{
    transform: translate(-22px,5px) skew(21deg); 
  }
`

export const Styled404Wrapper = styled.div`
  animation: ${glitch} 1s linear infinite;

  font-size: 5rem;

  ${({ theme }) => theme.media.up.md} {
    font-size: 10rem;
  }
  ${({ theme }) => theme.media.up.lg} {
    font-size: 15rem;
  }
  ${({ theme }) => theme.media.up.xl} {
    font-size: 20rem;
  }

  &:before,
  &:after {
    content: attr(title);
    position: absolute;
    left: 0;
  }

  &:before {
    animation: ${glitchTop} 1s linear infinite;
    clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
    -webkit-clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
  }

  &:after {
    animation: ${glitchBotom} 1.5s linear infinite;
    clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
    -webkit-clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
  }
`

export const StyledPage = styled.div`
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
`
