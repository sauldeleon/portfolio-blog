import Link from 'next/link'
import styled from 'styled-components'

export const StyledMessage = styled.p<{ $error?: boolean }>`
  font-size: 0.8rem;
  color: ${({ theme, $error }) =>
    $error ? theme.colors.orange : theme.colors.white};
  padding: 3rem 0;
  text-align: center;
  margin: 0;
`

export const StyledBackLink = styled(Link)`
  color: ${({ theme }) => theme.colors.green};
`
