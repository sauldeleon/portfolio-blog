import styled from 'styled-components'

export const StyledElevationChart = styled.div`
  padding: 0.5rem 0.25rem 0.25rem;
  border-top: 1px solid rgba(251, 251, 251, 0.06);

  /* Clicking focuses the chart; the outline would frame the whole profile. */
  .recharts-wrapper,
  .recharts-surface {
    outline: none;
  }
`

export const StyledElevationLabel = styled.div`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(251, 251, 251, 0.35);
  padding: 0 0.5rem 0.25rem;
`
