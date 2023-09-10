import Link from 'next/link'
import { Modal } from 'react-overlays'
import styled from 'styled-components'

import { CloseIcon } from '@sdlgr/assets'
import { Button } from '@sdlgr/button'
import { Heading, Label } from '@sdlgr/typography'

export const StyledBackdrop = styled.div`
  position: fixed;
  z-index: 1040;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.black};
  opacity: 0.5;
`

export const StyledAboutModal = styled(Modal)`
  position: fixed;
  top: 30%;
  left: 50%;
  z-index: 1040;
  transform: translate(-51%, -40%);
  width: 100%;
  max-width: 800px;
  border: 1px solid ${({ theme }) => theme.colors.white};
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.black};
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
`

export const StyledModalContent = styled.div`
  position: relative;
  padding: 20px;
`

export const StyledModalHeading = styled(Heading)`
  margin-bottom: 40px;
`

export const StyledLabel = styled(Label)`
  margin: 20px 0 10px;
`

export const StyledModalCloseButton = styled(Button)`
  position: absolute;
  top: 20px;
  right: 20px;
  color: ${({ theme }) => theme.colors.white};
  ${({ theme }) => theme.helpers.textBottomBorder.removeAfter}
`

export const StyledPropertyWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const StyledCloseIcon = styled(CloseIcon)``

export const StyledIconLink = styled(Link)`
  ${({ theme }) => theme.helpers.textBottomBorder.removeAfter}
`

export const StyledList = styled.ul`
  list-style: none;
  display: flex;
  gap: 1rem;
`
