import styled from 'styled-components'

export const StyledPreviewWrapper = styled.div`
  font-size: 0.8rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.9;

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-roboto-mono);
    font-weight: 400;
    margin: 1.25rem 0 0.5rem;
  }

  h1 {
    font-size: 1.2rem;
  }
  h2 {
    font-size: 1rem;
  }
  h3 {
    font-size: 0.875rem;
  }

  p {
    margin: 0.75rem 0;
  }

  code {
    background: rgba(152, 223, 214, 0.1);
    border-radius: 2px;
    padding: 0.1em 0.3em;
    font-size: 0.75em;
  }

  pre {
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(251, 251, 251, 0.1);
    border-radius: 2px;
    padding: 0.75rem;
    overflow-x: auto;
    font-size: 0.75rem;
  }

  ul,
  ol {
    padding-left: 1.25rem;
    margin: 0.5rem 0;
  }

  li {
    margin: 0.25rem 0;
  }

  blockquote {
    border-left: 2px solid ${({ theme }) => theme.colors.green};
    margin: 0.75rem 0;
    padding-left: 0.75rem;
    opacity: 0.7;
  }

  a {
    color: ${({ theme }) => theme.colors.green};
  }

  hr {
    border: none;
    border-top: 1px solid rgba(251, 251, 251, 0.1);
    margin: 1rem 0;
  }
`

export const StyledLoading = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.3;
  padding-top: 0.5rem;
`
