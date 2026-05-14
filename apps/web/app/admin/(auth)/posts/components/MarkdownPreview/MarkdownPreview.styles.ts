import styled from 'styled-components'

export const StyledPreviewWrapper = styled.div`
  font-size: 0.68rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.9;

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-roboto-mono);
    font-weight: 600;
    color: ${({ theme }) => theme.colors.green};
    line-height: 1.3;
  }

  h1 {
    font-size: 1.35rem;
    margin: 0 0 1rem;
  }
  h2 {
    font-size: 1.05rem;
    margin: 2rem 0 0.5rem;
  }
  h3 {
    font-size: 0.875rem;
    margin: 1.5rem 0 0.4rem;
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.85;
  }
  h4 {
    font-size: 0.8rem;
    margin: 1.25rem 0 0.4rem;
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.7;
  }

  p {
    margin: 0.75rem 0;
    font-size: 0.8rem;
  }

  code {
    background: rgba(152, 223, 214, 0.12);
    border-radius: 2px;
    padding: 0.1em 0.35em;
    font-size: 0.85em;
  }

  pre {
    background: #0d1117;
    border: 1px solid rgba(251, 251, 251, 0.08);
    border-radius: 3px;
    padding: 0.875rem 1rem;
    overflow-x: auto;
    font-size: 0.72rem;
    line-height: 1.65;
    tab-size: 2;

    code {
      background: none;
      padding: 0;
      font-size: inherit;
      color: #e6edf3;
      counter-reset: none;
    }

    [data-line] {
      padding: 0 0.25rem;
    }
  }

  /* rehype-pretty-code language label */
  [data-rehype-pretty-code-title] {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(251, 251, 251, 0.08);
    border-bottom: none;
    border-radius: 3px 3px 0 0;
    padding: 0.3rem 0.75rem;
    font-size: 0.65rem;
    color: rgba(251, 251, 251, 0.4);
    letter-spacing: 0.05em;

    + div > pre {
      border-radius: 0 0 3px 3px;
    }
  }

  ul {
    list-style: disc;
    padding-left: 1.4rem;
    margin: 0.5rem 0;
    font-size: 0.75rem;
  }

  ol {
    list-style: decimal;
    padding-left: 1.4rem;
    margin: 0.5rem 0;
    font-size: 0.75rem;
  }

  li {
    margin: 0.3rem 0;
  }

  blockquote {
    border-left: 2px solid ${({ theme }) => theme.colors.green};
    margin: 1rem 0;
    padding: 0.25rem 0 0.25rem 0.875rem;
    opacity: 0.7;
  }

  a {
    color: ${({ theme }) => theme.colors.green};
    text-decoration: underline;
    text-decoration-color: rgba(152, 223, 214, 0.4);

    &:hover {
      text-decoration-color: ${({ theme }) => theme.colors.green};
    }
  }

  hr {
    border: none;
    border-top: 1px solid rgba(251, 251, 251, 0.1);
    margin: 1.5rem 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.75rem 0;
    font-size: 0.75rem;
  }

  th,
  td {
    border: 1px solid rgba(251, 251, 251, 0.12);
    padding: 0.4rem 0.75rem;
    text-align: left;
  }

  th {
    color: ${({ theme }) => theme.colors.green};
    font-weight: 600;
    background: rgba(152, 223, 214, 0.05);
  }

  strong {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.white};
  }

  em {
    font-style: italic;
    opacity: 0.85;
  }
`

export const StyledCodeWrapper = styled.div`
  position: relative;
`

export const StyledCopyButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(251, 251, 251, 0.1);
  border-radius: 2px;
  color: rgba(251, 251, 251, 0.35);
  font-family: var(--font-roboto-mono), monospace;
  font-size: 0.58rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  z-index: 1;
  transition:
    color 0.15s,
    background 0.15s,
    border-color 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(251, 251, 251, 0.2);
    color: rgba(251, 251, 251, 0.65);
  }
`

export const StyledLoading = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.3;
  padding-top: 0.5rem;
`
