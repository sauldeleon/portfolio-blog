import styled from 'styled-components'

export const StyledPage = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

export const StyledHeading = styled.h1`
  ${({ theme }) => theme.typography.heading.heading1};
  margin-bottom: 50px;
`
