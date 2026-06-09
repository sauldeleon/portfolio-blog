import styled from 'styled-components'

export const StyledConfirmPage = styled.main`
  width: 100%;
  max-width: 560px;
  padding: 5rem 1rem 8rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const StyledConfirmTitle = styled.h1`
  font-family: var(--font-roboto-mono);
  font-weight: 400;
  color: #98dfd6;
  font-size: 1.5rem;
  margin: 0;
`

export const StyledConfirmText = styled.p`
  font-family: var(--font-roboto-mono);
  font-weight: 300;
  color: rgba(251, 251, 251, 0.7);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
`

export const StyledConfirmLink = styled.a`
  font-family: var(--font-roboto-mono);
  font-size: 0.875rem;
  color: #98dfd6;
  text-decoration: underline;
  margin-top: 1rem;
`
