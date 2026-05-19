import styled, { css } from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledArticle = styled.article`
  color: ${({ theme }) => theme.colors.white};
  line-height: 1.75;
  font-size: 0.9rem;

  @media (width >= 768px) {
    font-size: 1rem;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: var(--font-roboto-mono);
    font-weight: 600;
    color: ${({ theme }) => theme.colors.green};
    line-height: 1.3;
  }

  h2 {
    font-size: 1.15rem;
    margin: 2rem 0 0.75rem;

    @media (width >= 768px) {
      font-size: 1.5rem;
      margin: 2.5rem 0 0.75rem;
    }
  }

  h3 {
    font-size: 0.95rem;
    margin: 1.5rem 0 0.5rem;
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.9;

    @media (width >= 768px) {
      font-size: 1.15rem;
      margin: 2rem 0 0.5rem;
    }
  }

  h4 {
    font-size: 0.875rem;
    margin: 1.25rem 0 0.4rem;
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.75;

    @media (width >= 768px) {
      font-size: 1rem;
      margin: 1.5rem 0 0.4rem;
    }
  }

  p {
    margin: 1rem 0;
  }

  code {
    background: rgba(152, 223, 214, 0.12);
    border-radius: 2px;
    padding: 0.1em 0.35em;
    font-size: 0.875em;
  }

  pre code {
    background: none;
    padding: 1rem;
    font-size: inherit;
    border-radius: 0;
  }

  ul {
    list-style: disc;
    padding-left: 1.5rem;
    margin: 0.75rem 0;
  }

  ol {
    list-style: decimal;
    padding-left: 1.5rem;
    margin: 0.75rem 0;
  }

  li {
    margin: 0.35rem 0;
  }

  blockquote {
    border-left: 2px solid ${({ theme }) => theme.colors.green};
    margin: 1.5rem 0;
    padding: 0.25rem 0 0.25rem 1.25rem;
    opacity: 0.75;
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
    margin: 2rem 0;
  }

  strong {
    font-weight: 700;
    color: ${({ theme }) => theme.colors.white};
  }

  em {
    font-style: italic;
    opacity: 0.85;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`

export const StyledImageWrapper = styled.figure<{
  $align?: string | null
  $size?: string | null
  $expandable?: boolean
}>`
  margin: 2rem 0;

  ${({ $size, $align }) => {
    const maxWidth =
      $size === 'small' ? '16rem' : $size === 'medium' ? '28rem' : '1440px'

    if ($align === 'right')
      return css`
        float: right;
        clear: right;
        max-width: ${maxWidth};
        width: 100%;
        margin: 0 0 1.5rem 2rem;

        @media (max-width: 640px) {
          float: none;
          max-width: 100%;
          margin: 1.5rem 0;
        }
      `
    if ($align === 'left')
      return css`
        float: left;
        clear: left;
        max-width: ${maxWidth};
        width: 100%;
        margin: 0 2rem 1.5rem 0;

        @media (max-width: 640px) {
          float: none;
          max-width: 100%;
          margin: 1.5rem 0;
        }
      `
    return css`
      max-width: ${maxWidth};
      width: 100%;
      ${$size ? 'margin: 2rem auto;' : ''}
    `
  }}

  img {
    display: block;
    width: 100%;
    height: auto;
    max-width: 1440px;
    border-radius: 2px;
  }

  ${({ $expandable }) =>
    $expandable &&
    css`
      cursor: zoom-in;

      &:hover {
        opacity: 0.9;
      }
    `}
`

export const StyledCaption = styled.figcaption`
  font-size: 0.8rem;
  color: rgba(251, 251, 251, 0.5);
  text-align: center;
  margin: 0.5rem 0;
  font-style: italic;
  letter-spacing: 0.02em;
`

export const StyledModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
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
  font-size: 0.8rem;
  color: rgba(251, 251, 251, 0.55);
  text-align: center;
  font-style: italic;
`

export const StyledModalDownload = styled.a`
  font-size: 0.7rem;
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
  margin: 2rem 0;
  border-radius: 2px;
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
