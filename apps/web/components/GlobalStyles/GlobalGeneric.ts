import { createGlobalStyle, css } from 'styled-components'

// GlobalStyle cannot be snapshot tested https://github.com/masakudamatsu/nextjs-template/issues/17
/* istanbul ignore next */
export const GlobalStyle = createGlobalStyle`
  ${({ theme: { fonts, typography, colors } }) => css`
    :root {
      font-size: ${fonts.baseSize}px;
    }

    html {
      font-size: 100%;
      scroll-behavior: smooth;
    }

    body {
      -webkit-text-size-adjust: 100%;
      -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
      -webkit-font-smoothing: antialiased;
      background-color: ${colors.black};
      ${typography.body.M}
    }
  `}
`
