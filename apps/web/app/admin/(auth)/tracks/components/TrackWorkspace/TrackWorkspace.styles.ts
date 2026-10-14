import styled, { css } from 'styled-components'

import {
  StyledAdminBackLink,
  StyledAdminError,
} from '../../../components/AdminForm/AdminForm.styles'

export const StyledWorkspace = styled.div<{
  $filled: boolean
  $fullscreen: boolean
}>`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 0 2rem;
  color: ${({ theme }) => theme.colors.white};

  ${({ $filled }) =>
    $filled &&
    css`
      /* Fills the viewport: only the panel scrolls. */
      padding-bottom: 1rem;
      overflow: hidden;
    `}

  ${({ $fullscreen, theme }) =>
    $fullscreen &&
    css`
      /* Covers the whole window, site header included. */
      position: fixed;
      inset: 0;
      z-index: 2000;
      padding: 0.75rem 1rem;
      background: ${theme.colors.black};
      overflow-y: auto;

      ${theme.media.up.lg} {
        overflow: hidden;
      }
    `}
`

export const StyledTopBar = styled.div`
  flex: none;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
`

export const StyledBackLink = styled(StyledAdminBackLink)``

export const StyledHeading = styled.h1`
  font-size: 0.9rem;
  font-weight: 400;
  letter-spacing: 0.04em;
  margin: 0.5rem 0 0.25rem;
  overflow-wrap: anywhere;
`

export const StyledSummary = styled.p`
  font-size: 0.7rem;
  opacity: 0.6;
  margin: 0;
`

export const StyledTopBarActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  max-width: 820px;

  > button {
    text-transform: uppercase;
  }
`

export const StyledTarget = styled.span`
  flex-basis: 100%;
  text-align: right;
  font-size: 0.65rem;
  opacity: 0.6;
  overflow-wrap: anywhere;
`

export const StyledError = styled(StyledAdminError)``

export const StyledSaveResult = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  font-size: 0.7rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.green};

  code {
    overflow-wrap: anywhere;
    opacity: 0.85;
  }

  span:last-child {
    flex-basis: 100%;
    opacity: 0.5;
  }
`

export const StyledBody = styled.div<{
  $floating: boolean
  $panelOpen: boolean
}>`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  ${({ theme }) => theme.media.up.lg} {
    flex: 1 1 auto;
    min-height: 0;

    ${({ $floating, $panelOpen }) =>
      $floating
        ? css`
            gap: 0.5rem;
          `
        : css`
            /* Map and profile on the left, the panel spanning both rows. */
            display: grid;
            grid-template-columns: minmax(0, 1fr) ${
              $panelOpen ? '360px' : 'auto'
            };
            grid-template-rows: minmax(0, 1fr) auto;
            gap: 0.5rem 1.5rem;

            > :nth-child(1),
            > :nth-child(2) {
              grid-column: 1;
            }
          `}
  }
`

/** The map; in fullscreen the panel floats over its right side. */
export const StyledMapStage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;

  ${({ theme }) => theme.media.up.lg} {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    gap: 0;
  }
`

// Floats below the map's layer switcher and above its attribution.
const floatingBox = css`
  position: absolute;
  z-index: 1000;
  top: 3.25rem;
  right: 0.75rem;
  background: ${({ theme }) => theme.colors.black};
`

const dockedBox = css`
  grid-column: 2;
  grid-row: 1 / span 2;
  min-height: 0;
`

export const StyledSidebar = styled.div<{ $floating: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  ${({ theme }) => theme.media.up.lg} {
    overflow-y: auto;
    ${({ $floating }) =>
      $floating
        ? css`
            ${floatingBox}
            bottom: 2rem;
            width: 360px;
            /* No top padding: sticky content would leave a strip above it
               where the scrolled content shows through. */
            padding: 0 1rem;

            > :first-child {
              padding-top: 0.75rem;
            }
            border: 1px solid rgba(251, 251, 251, 0.15);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          `
        : dockedBox}
  }
`

export const StyledPanelToggle = styled.div<{ $floating: boolean }>`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.media.up.lg} {
    ${({ $floating }) => ($floating ? floatingBox : dockedBox)}
  }
`

export const StyledTabs = styled.div`
  display: flex;
  gap: 2px;

  > [role='tablist'] {
    flex: 1;
    display: flex;
    gap: 2px;

    > button {
      flex: 1;
    }
  }
`
