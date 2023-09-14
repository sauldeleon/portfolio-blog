import { createGlobalStyle, css } from 'styled-components'

// GlobalStyle cannot be snapshot tested https://github.com/masakudamatsu/nextjs-template/issues/17
/* istanbul ignore next */
export const GlobalTypography = createGlobalStyle`
  ${({ theme: { fontStyles, fonts, typography, colors, helpers } }) => css`
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p {
      font-family: ${fonts.bodyFont};
      color: ${colors.white};
    }

    h1 {
      ${typography.heading.heading1};
    }

    h2 {
      ${typography.heading.heading2};
    }

    p {
      font-size: ${fonts.baseSize}px;
      line-height: normal;
    }

    a {
      color: ${colors.white};
      text-decoration: none;
    }

    button {
      font-family: ${fonts.bodyFont};
    }

    i,
    em {
      font-style: italic;
    }

    b,
    strong {
      ${fontStyles.robotoMono.medium}
    }
  `}
`
