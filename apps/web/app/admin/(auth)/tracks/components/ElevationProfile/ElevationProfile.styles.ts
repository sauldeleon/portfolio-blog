import styled from 'styled-components'

export const StyledProfile = styled.div`
  flex: none;
  padding: 0.5rem 0 0;
  cursor: crosshair;

  /* Clicking focuses the chart; the outline would frame the whole profile. */
  .recharts-wrapper,
  .recharts-surface {
    outline: none;
  }
`

export const StyledEmpty = styled.p`
  margin: 0;
  padding: 0.75rem 0;
  font-size: 0.7rem;
  opacity: 0.5;
  text-align: center;
`
