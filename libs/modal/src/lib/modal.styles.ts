import { Modal as ModalOverlays } from 'react-overlays'
import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledBackdrop = styled.div`
  position: fixed;
  z-index: 1040;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.black};
  opacity: 0.7;
`

export const StyledModal = styled(ModalOverlays)`
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 1040;
  border: 1px solid ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.black};

  ${({ theme }) => theme.media.up.md} {
    top: 30%;
    left: 50%;
    transform: translate(-51%, -40%);
    width: 100%;
    height: auto;
    max-width: 800px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  }
`

export const StyledModalContent = styled.div`
  position: relative;
  padding: 40px;
`

export const StyledModalCloseButton = styled(Button)`
  position: absolute;
  top: 20px;
  right: 20px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.helpers.textBottomBorder.removeAfter}
`
