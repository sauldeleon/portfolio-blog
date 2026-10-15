import styled from 'styled-components'

import { Input } from '@sdlgr/input'

export const StyledPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.75rem;
`

export const StyledHelp = styled.p`
  margin: 0;
  font-size: 0.65rem;
  line-height: 1.5;
  opacity: 0.55;
`

export const StyledStatsTable = styled.table`
  /* Stays in view while scrolling the filters, so the preview numbers can be
     watched as parameters change. */
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  border-collapse: collapse;
  font-size: 0.7rem;
  background: ${({ theme }) => theme.colors.black};
  box-shadow: 0 1px 0 rgba(251, 251, 251, 0.12);

  th,
  td {
    padding: 0.3rem 0.4rem;
    text-align: right;
    border-bottom: 1px solid rgba(251, 251, 251, 0.06);
  }

  th[scope='row'] {
    text-align: left;
    font-weight: 400;
    opacity: 0.6;
  }

  thead th {
    font-weight: 400;
    opacity: 0.6;
  }
`

export const StyledScope = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

export const StyledFilter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.75rem 0;
  border-top: 1px solid rgba(251, 251, 251, 0.06);
`

export const StyledFields = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`

export const StyledFieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.65rem;
  opacity: 0.85;
`

export const StyledNumberInput = styled(Input)`
  width: 110px;
  font-size: 0.75rem;
  padding: 0.25rem 0;

  &:disabled {
    opacity: 0.35;
  }
`

export const StyledAlgorithms = styled.div`
  display: flex;
  gap: 2px;

  > button {
    flex: 1;
    min-width: 0;
    /* The label variant never wraps; long names would overflow the panel. */
    white-space: normal;
    text-align: center;
  }
`

export const StyledButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
  padding: 0.75rem 0;

  > button {
    text-transform: uppercase;
  }
  background: ${({ theme }) => theme.colors.black};
`
