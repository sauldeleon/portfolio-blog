import styled from 'styled-components'

export const StyledRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;

  & > *:first-child {
    flex: 1;
    min-width: 0;
  }
`

export const StyledError = styled.p`
  margin: 0.25rem 0 0;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.orange};
`
