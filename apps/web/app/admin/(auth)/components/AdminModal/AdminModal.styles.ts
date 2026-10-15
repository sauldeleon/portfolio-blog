import { Modal as ModalOverlays } from 'react-overlays'
import styled, { css } from 'styled-components'

/** Base pieces shared by the admin's modals. */

export const StyledAdminBackdrop = styled.div`
  position: fixed;
  z-index: 1040;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.black};
  opacity: 0.7;
`

export type AdminDialogTone = 'success' | 'danger'

/** Glowing border shared by every admin modal. */
const frame = css<{ $tone?: AdminDialogTone }>`
  border: 1px solid
    ${({ $tone = 'success', theme }) =>
      $tone === 'danger' ? theme.colors.orange : theme.colors.green};
  box-shadow: 0 0 16px 4px
    ${({ $tone = 'success' }) =>
      $tone === 'danger'
        ? 'rgba(176, 75, 47, 0.5)'
        : 'rgba(152, 223, 214, 0.5)'};
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.black};
`

// The modal takes focus when it opens so the keyboard stays inside; its own
// box needs no focus ring (its buttons and inputs keep theirs).
const noFocusRing = css`
  &:focus-visible {
    outline: none;
  }
`

// Full screen on mobile; each modal family places itself from md up.
const fullScreen = css`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
`

/** Modal whose content box carries the frame (upload and edit forms). */
export const StyledAdminModal = styled(ModalOverlays)<{ $maxWidth?: string }>`
  ${fullScreen}
  ${noFocusRing}
  z-index: 1050;

  ${({ theme }) => theme.media.up.md} {
    top: 20%;
    left: 50%;
    transform: translate(-50%, 0);
    width: 100%;
    height: auto;
    max-width: ${({ $maxWidth = '480px' }) => $maxWidth};
  }
`

/**
 * Modal framed by its own glowing border. `center` suits short dialogs
 * (confirmations); `top` suits tall editors, which scroll within 90vh.
 */
export const StyledAdminDialog = styled(ModalOverlays)<{
  $maxWidth: string
  $placement: 'center' | 'top'
  $tone?: AdminDialogTone
}>`
  ${fullScreen}
  ${frame}
  ${noFocusRing}
  z-index: 1040;
  /* Tall editors scroll inside the dialog instead of spilling out of it. */
  overflow-y: auto;

  ${({ theme }) => theme.media.up.md} {
    left: 50%;
    width: 100%;
    height: auto;
    max-width: ${({ $maxWidth }) => $maxWidth};
    ${({ $placement }) =>
      $placement === 'center'
        ? css`
            top: 30%;
            transform: translate(-51%, -40%);
          `
        : css`
            top: 5vh;
            transform: translateX(-50%);
            max-height: 90vh;
          `}
  }
`

/** Padded column inside a {@link StyledAdminDialog}. */
export const StyledAdminModalBody = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const StyledAdminModalContent = styled.div<{ $tone?: AdminDialogTone }>`
  ${frame}
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const StyledAdminModalTitle = styled.h2`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
`

export const StyledAdminDropzone = styled.div<{ $isDragActive: boolean }>`
  border: 2px dashed
    ${({ $isDragActive, theme }) =>
      $isDragActive ? theme.colors.green : 'rgba(251, 251, 251, 0.2)'};
  border-radius: 2px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.7;
  font-size: 0.75rem;

  &:hover {
    border-color: ${({ theme }) => theme.colors.green};
    opacity: 1;
  }
`
