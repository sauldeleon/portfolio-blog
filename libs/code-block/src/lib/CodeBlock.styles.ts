import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledCodeBlock = styled.div`
  position: relative;
  margin: 1.5rem 0;
  border: 1px solid #30363d;
  overflow: hidden;
  background-color: #0d1117;

  pre {
    margin: 0;
    padding: 0;
    overflow-x: auto;
    font-size: 0.875rem;
    line-height: 1.6;
    background-color: #0d1117;
  }
`

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 1rem;
  background-color: #161b22;
  border-bottom: 1px solid #30363d;
  min-height: 2rem;
`

export const StyledLang = styled.span`
  font-family: var(--font-roboto-mono, monospace);
  font-size: 0.75rem;
  opacity: 0.5;
  text-transform: lowercase;
`

export const StyledCopyButton = styled(Button).attrs({ variant: 'ghost' })`
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(251, 251, 251, 0.1);
  border-radius: 2px;
  color: rgba(251, 251, 251, 0.35);
  font-family: var(--font-roboto-mono, monospace);
  font-size: 0.58rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  transition:
    color 0.15s,
    background 0.15s,
    border-color 0.15s;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(251, 251, 251, 0.2);
    color: rgba(251, 251, 251, 0.65);
  }
`
