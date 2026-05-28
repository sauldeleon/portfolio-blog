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

export const StyledGpxMapModal = styled(ModalOverlays)`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 1040;
  border: 1px solid ${({ theme }) => theme.colors.green};
  box-shadow: 0 0 16px 4px rgba(152, 223, 214, 0.5);
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.black};

  ${({ theme }) => theme.media.up.md} {
    top: 5vh;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: auto;
    max-width: min(900px, 90vw);
    max-height: 90vh;
    overflow: hidden;
  }
`

export const StyledModalContent = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const StyledLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
  color: ${({ theme }) => theme.colors.white};
`

export const StyledInput = styled.input`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.45rem 0.75rem;
  width: 100%;
  box-sizing: border-box;

  &::placeholder {
    opacity: 0.35;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledCheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.85;
  color: ${({ theme }) => theme.colors.white};

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  input[type='checkbox'] {
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledPreview = styled.pre`
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  font-size: 0.72rem;
  line-height: 1.5;
  margin: 0;
  max-height: 7.7rem;
  opacity: 0.7;
  overflow: auto;
  padding: 0.6rem 0.75rem;
  white-space: pre-wrap;
  word-break: break-all;
`

export const StyledWaypointImagesSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 0.75rem;
`

export const StyledMappingsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: min(200px, 25vh);
  overflow-y: auto;
  padding-right: 0.25rem;
`

export const StyledSectionLabel = styled.p`
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`

export const StyledFetchStatus = styled.p`
  font-size: 0.75rem;
  opacity: 0.5;
  color: ${({ theme }) => theme.colors.white};
  margin: 0;
`

export const StyledAddRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

export const StyledPickImageButton = styled.button`
  align-self: stretch;
  background: none;
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  font-family: inherit;
  font-size: 0.72rem;
  opacity: 0.75;
  padding: 0 0.7rem;
  white-space: nowrap;

  &:hover {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.green};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`

export const StyledMappingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  padding: 0.35rem 0.5rem;
`

export const StyledMappingThumb = styled.img`
  width: 36px;
  height: 36px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
`

export const StyledMappingName = styled.span`
  flex: 1;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.85;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const StyledRemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  font-size: 0.9rem;
  line-height: 1;
  opacity: 0.4;
  padding: 2px 4px;

  &:hover {
    opacity: 1;
  }
`

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
`

export const StyledCancelButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  padding: 0.375rem 0.875rem;
  color: ${({ theme }) => theme.colors.white};
  border-color: rgba(255, 255, 255, 0.25);
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:hover {
    opacity: 1;
    border-color: rgba(255, 255, 255, 0.5);
  }
`

export const StyledInsertButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  padding: 0.375rem 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.green};
  border-color: ${({ theme }) => theme.colors.green};

  &:hover:not(:disabled) {
    box-shadow: 0 0 8px 1px rgba(152, 223, 214, 0.4);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`
