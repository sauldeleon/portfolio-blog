import styled from 'styled-components'

export const StyledPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.75rem;
`

export const StyledHelp = styled.p`
  margin: 0;
  font-size: 0.65rem;
  line-height: 1.6;
  opacity: 0.55;
  white-space: pre-line;
`

export const StyledSegments = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  > button {
    justify-content: flex-start;
  }
`

export const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  p {
    margin: 0;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.25rem 1rem;
    margin: 0;
    font-size: 0.7rem;
  }

  dt {
    opacity: 0.55;
  }

  dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
`

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;

  > button {
    text-transform: uppercase;
  }
`
