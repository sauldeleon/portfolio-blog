import styled from 'styled-components'

export const StyledFlowSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const StyledCheckboxRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
`

export const StyledCheckbox = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;

  input {
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.green};
  }
`
