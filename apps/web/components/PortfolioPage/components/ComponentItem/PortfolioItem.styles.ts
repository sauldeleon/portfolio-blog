import { styled } from 'styled-components'

export const StyledSection = styled.section`
  border: 3px solid ${({ theme }) => theme.colors.white};
  border-bottom: none;
  padding: 1rem;
  width: 100%;
  //testing purposes
  height: 700px;

  &:last-child {
    border-bottom: 3px solid ${({ theme }) => theme.colors.white};
  }
`
