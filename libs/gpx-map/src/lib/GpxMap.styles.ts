import styled from 'styled-components'

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

    tbody tr {
      cursor: pointer;
    }

    tr:hover td {
      background: rgba(128, 128, 128, 0.06);
    }
  }
`
