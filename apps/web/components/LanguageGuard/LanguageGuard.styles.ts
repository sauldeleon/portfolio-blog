import styled, { keyframes } from 'styled-components'

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`
export const StyledGuardWrapper = styled.div`
  opacity: 0;
  animation: ${fadeIn} 0.5s 1s linear forwards;
`
