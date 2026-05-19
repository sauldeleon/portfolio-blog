import styled from 'styled-components'

export const StyledTableWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  margin: 1.25rem 0;
`

export const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;
  font-size: 0.9rem;

  th,
  td {
    border: 1px solid rgba(251, 251, 251, 0.12);
    padding: 0.5rem 1rem;
    text-align: left;
  }

  th {
    color: ${({ theme }) => theme.colors.green};
    font-weight: 600;
    background: rgba(152, 223, 214, 0.05);
  }
`
