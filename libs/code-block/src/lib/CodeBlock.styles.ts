import styled from 'styled-components'

export const StyledCodeBlock = styled.div`
  position: relative;
  margin: 1.5rem 0;
  border: 1px solid rgba(251, 251, 251, 0.1);
  overflow: hidden;

  pre {
    margin: 0;
    padding: 1.25rem 1rem;
    overflow-x: auto;
    font-size: 0.875rem;
    line-height: 1.6;
  }
`

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 1rem;
  background-color: rgba(251, 251, 251, 0.05);
  border-bottom: 1px solid rgba(251, 251, 251, 0.1);
  min-height: 2rem;
`

export const StyledLang = styled.span`
  font-family: var(--font-roboto-mono, monospace);
  font-size: 0.75rem;
  opacity: 0.5;
  text-transform: lowercase;
`

export const StyledCopyButton = styled.button`
  font-family: var(--font-roboto-mono, monospace);
  font-size: 0.7rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.green};
  padding: 0.125rem 0.375rem;
  opacity: 0.7;
  transition: opacity 0.15s;
  margin-left: auto;

  &:hover {
    opacity: 1;
  }
`
