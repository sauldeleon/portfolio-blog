import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledGpxMap = styled.div`
  margin: 2rem 0;
`

export const StyledMapContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 2px;
  overflow: hidden;

  .leaflet-container {
    width: 100%;
    height: 100%;
    border-radius: 2px;
  }
`

export const StyledDownloadBar = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 0.35rem 0;
`

export const StyledDownloadButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  display: inline-flex;
  gap: 0.35rem;
  border-color: rgba(128, 128, 128, 0.3);
  border-radius: 4px;
  padding: 0.3rem 0.65rem;
  font-size: 0.75rem;
  opacity: 0.7;
  color: inherit;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: rgba(128, 128, 128, 0.6);
  }
`

export const StyledLocateButton = styled(Button).attrs({
  variant: 'ghost',
})`
  border: none;
  padding: 2px 4px;
  opacity: 0.45;
  color: inherit;

  &:hover:not(:disabled) {
    border: none;
    opacity: 1;
  }
`

export const StyledRowChevron = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  align-items: center;
  margin-right: 0.35rem;
  opacity: 0.45;
  transition: transform 0.15s;
  transform: ${({ $expanded }) =>
    $expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  vertical-align: middle;
  flex-shrink: 0;
`

export const StyledWaypointImageCard = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 2px;
  display: block;
  margin-bottom: 0.5rem;
`

export const StyledTableWrapper = styled.div`
  overflow-x: auto;
`

export const StyledTrackStrip = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.35rem 0;
`

export const StyledTrackChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 4px;
  overflow: hidden;
`

export const StyledTrackDot = styled.span<{ $color: string; $active: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color, $active }) => ($active ? $color : 'transparent')};
  border: 1.5px solid ${({ $color }) => $color};
  flex-shrink: 0;
`

export const StyledTrackToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  font-size: 0.75rem;
  color: inherit;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }

  &[aria-pressed='false'] {
    opacity: 0.4;
  }
`

export const StyledTrackDownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  border-left: 1px solid rgba(128, 128, 128, 0.25);
  cursor: pointer;
  padding: 0.3rem 0.45rem;
  color: inherit;
  opacity: 0.55;

  &:hover {
    opacity: 1;
  }
`

export const StyledLayerSwitcher = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1000;
  display: flex;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
`

export const StyledLayerButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)'};
  border: none;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
  padding: 0.28rem 0.6rem;
  font-size: 0.68rem;
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  color: ${({ $active }) => ($active ? '#111' : '#555')};
  line-height: 1;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    color: #111;
  }
`

export const StyledWaypointsDetails = styled.details`
  margin-top: 0.75rem;
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 4px;
  overflow: hidden;

  summary {
    cursor: pointer;
    padding: 0.6rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    user-select: none;
    list-style: none;

    &::before {
      content: '▶';
      display: inline-block;
      margin-right: 0.5rem;
      font-size: 0.65rem;
      transition: transform 0.15s;
    }
  }

  &[open] summary::before {
    transform: rotate(90deg);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;

    th,
    td {
      padding: 0.4rem 1rem;
      text-align: left;
      border-top: 1px solid rgba(128, 128, 128, 0.15);
    }

    th {
      font-weight: 600;
      opacity: 0.7;
    }

    th:last-child,
    td:last-child {
      width: 2rem;
      padding-left: 0;
    }

    tbody tr[data-clickable] {
      cursor: pointer;
    }

    tr:hover td {
      background: rgba(128, 128, 128, 0.06);
    }

    tr[data-expanded] td {
      background: rgba(245, 158, 11, 0.08);
    }

    tr[data-details] {
      cursor: default;

      td {
        padding-top: 0;
        border-top: none;
        background: rgba(245, 158, 11, 0.04);

        p {
          margin: 0 0 0.5rem;
          opacity: 0.75;
          font-size: 0.78rem;
          line-height: 1.5;
        }
      }
    }
  }
`
