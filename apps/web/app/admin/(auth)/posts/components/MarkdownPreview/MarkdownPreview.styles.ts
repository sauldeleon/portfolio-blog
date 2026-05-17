import styled, { css } from 'styled-components'

import { Button } from '@sdlgr/button'

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

export const StyledCopyButton = styled(Button).attrs({ variant: 'ghost' })`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(251, 251, 251, 0.1);
  border-radius: 2px;
  color: rgba(251, 251, 251, 0.35);
  font-family: var(--font-roboto-mono), monospace;
  font-size: 0.58rem;
  line-height: 1;
  padding: 0.25rem 0.5rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  z-index: 1;
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

export const StyledLoading = styled.div`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.3;
  padding-top: 0.5rem;
`

export const StyledImageWrapper = styled.div<{
  $align?: string | null
  $size?: string | null
  $expandable?: boolean
}>`
  margin: 1.75rem 0;

  ${({ $size, $align }) => {
    const width =
      $size === 'small' ? '16rem' : $size === 'medium' ? '28rem' : '100%'

    if ($align === 'right')
      return css`
        float: right;
        clear: right;
        width: ${width};
        margin: 0 0 1.5rem 1.5rem;
      `
    if ($align === 'left')
      return css`
        float: left;
        clear: left;
        width: ${width};
        margin: 0 1.5rem 1.5rem 0;
      `
    return css`
      width: ${width};
      ${$size ? 'margin: 1.75rem auto;' : ''}
    `
  }}

  img {
    display: block;
    width: 100%;
    height: auto;
    border-radius: 3px;
  }

  ${({ $expandable }) =>
    $expandable &&
    css`
      cursor: zoom-in;

      &:hover {
        opacity: 0.85;
      }
    `}
`

export const StyledCaption = styled.figcaption`
  font-size: 0.65rem;
  color: rgba(251, 251, 251, 0.45);
  text-align: center;
  margin: 0.4rem 0;
  font-style: italic;
  letter-spacing: 0.02em;
`

export const StyledModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.88);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

export const StyledModalContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 90vw;
`

export const StyledModalClose = styled(Button).attrs({ variant: 'text' })`
  position: absolute;
  top: -1.75rem;
  right: -0.5rem;
  color: rgba(251, 251, 251, 0.6);
  font-size: 1.25rem;
  line-height: 1;
  padding: 0.25rem;

  &::after {
    display: none;
  }

  &:hover {
    color: rgba(251, 251, 251, 1);
  }
`

export const StyledModalCaption = styled.figcaption`
  font-size: 0.75rem;
  color: rgba(251, 251, 251, 0.55);
  text-align: center;
  font-style: italic;
`

export const StyledModalDownload = styled.a`
  font-size: 0.65rem;
  color: rgba(251, 251, 251, 0.35);
  text-decoration: underline;

  &:hover {
    color: rgba(251, 251, 251, 0.75);
  }
`

export const StyledEmbedWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  height: 0;
  margin: 1.75rem 0;
  border-radius: 3px;
  overflow: hidden;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`
