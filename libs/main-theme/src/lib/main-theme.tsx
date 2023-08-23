import * as React from 'react'
import { css, keyframes } from 'styled-components'
import { Keyframes, RuleSet } from 'styled-components/dist/types'

import { SLLogo, SLLogoSVG } from '@sdlgr/assets'

const baseFontSize = 20

const rounded = (calc: number) => (calc >> 0 === calc ? calc : +calc.toFixed(5))
const fontSize = (px: number) => `${rounded(px / baseFontSize)}rem`
const getDownMedia = (size: number) => `@media (max-width: ${size - 1}px)`
const getUpMedia = (size: number) => `@media (min-width: ${size}px)`

const breakpoints = {
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1440,
}

const colors: MainTheme['colors'] = {
  white: '#FBFBFB',
  black: '#000000',
  green: '#98DFD6',
  blue: '#00235B',
  yellow: '#FFDD83',
  orange: '#B04B2F',
}

const fontFamilies: Record<'robotoMono', string> = {
  robotoMono: "'Roboto mono', monospace",
}

const fontStyles: MainTheme['fontStyles'] = {
  robotoMono: {
    thin: css`
      font-family: ${fontFamilies.robotoMono};
      font-weight: 100;
    `,
    light: css`
      font-family: ${fontFamilies.robotoMono};
      font-weight: 300;
    `,
    regular: css`
      font-family: ${fontFamilies.robotoMono};
      font-weight: 400;
    `,
    medium: css`
      font-family: ${fontFamilies.robotoMono};
      font-weight: 500;
    `,
  },
}

const typography: MainTheme['typography'] = {
  heading: {
    heading1: css`
      ${fontStyles.robotoMono.regular}
      color: ${colors.white};
      font-size: ${fontSize(60)};
      line-height: normal;
    `,
    heading2: css`
      ${fontStyles.robotoMono.regular}
      color: ${colors.white};
      font-size: ${fontSize(30)};
      line-height: normal;
    `,
  },
  body: {
    L: css`
      ${fontStyles.robotoMono.regular}
      color: ${colors.white};
      font-size: ${fontSize(20)};
      line-height: normal;
    `,
    M: css`
      ${fontStyles.robotoMono.regular}
      color: ${colors.white};
      font-size: ${fontSize(18)};
      line-height: normal;
    `,
    S: css`
      ${fontStyles.robotoMono.regular}
      color: ${colors.white};
      font-size: ${fontSize(16)};
      line-height: normal;
    `,
    XS: css`
      ${fontStyles.robotoMono.medium}
      color: ${colors.white};
      font-size: ${fontSize(11)};
      line-height: normal;
    `,
  },
  label: {
    L: css`
      ${fontStyles.robotoMono.medium}
      color: ${colors.white};
      font-size: ${fontSize(20)};
      line-height: normal;
      text-transform: uppercase;
    `,
    XS: css`
      ${fontStyles.robotoMono.medium}
      color: ${colors.white};
      font-size: ${fontSize(10)};
      line-height: normal;
      text-transform: uppercase;
    `,
  },
}

const bottomBorderTransformHoverAfter = css`
  &:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`

const bottomBorderTransformAfter = (duration: number) => css`
  &::after {
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform ${duration}s ease-out;
  }
`

export const mainTheme: MainTheme = {
  breakpoints,
  fontStyles,
  colors,
  typography,
  fonts: {
    baseSize: baseFontSize,
    bodyFont: fontFamilies.robotoMono,
  },
  logo: {
    component: SLLogo,
    svg: SLLogoSVG,
  },
  media: {
    down: {
      sm: getDownMedia(breakpoints.sm),
      md: getDownMedia(breakpoints.md),
      lg: getDownMedia(breakpoints.lg),
      xl: getDownMedia(breakpoints.xl),
    },
    up: {
      sm: getUpMedia(breakpoints.sm),
      md: getUpMedia(breakpoints.md),
      lg: getUpMedia(breakpoints.lg),
      xl: getUpMedia(breakpoints.xl),
    },
  },
  spacing: {
    verticalSpacer: { small: 50, large: 70 },
  },
  zIndex: {
    modal: 200,
  },
  helpers: {
    noLinkUnderline: css`
      &:hover,
      &:active,
      &:focus {
        text-decoration: none;
      }
    `,
    textBottomBorder: {
      shared: css`
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: ${({ theme }) => theme.colors.white};
        }
      `,
      after: (duration = 0.25) => bottomBorderTransformAfter(duration),
      hoverAfter: bottomBorderTransformHoverAfter,
      transform: (duration = 0.25) => css`
        ${bottomBorderTransformHoverAfter}
        ${bottomBorderTransformAfter(duration)}
      `,
    },
  },
  animation: {
    'clock-loading': keyframes`
      0% {
        stroke-dashoffset: 82;
      }
      100% {
        stroke-dashoffset: 0;
      }
    `,
  },
}

export interface MainTheme {
  colors: {
    black: string
    white: string
    green: string
    blue: string
    yellow: string
    orange: string
  }
  logo: {
    component: React.FunctionComponent<
      React.PropsWithChildren<
        React.SVGProps<SVGSVGElement> & {
          title?: string | undefined
        }
      >
    >
    svg: string
  }
  breakpoints: Record<'sm' | 'md' | 'lg' | 'xl', number>
  media: {
    down: Record<'sm' | 'md' | 'lg' | 'xl', string>
    up: Record<'sm' | 'md' | 'lg' | 'xl', string>
  }
  fontStyles: {
    robotoMono: Record<'thin' | 'light' | 'regular' | 'medium', RuleSet<object>>
  }
  typography: {
    heading: Record<`heading${1 | 2}`, RuleSet<object>>
    body: Record<'L' | 'M' | 'S' | 'XS', RuleSet<object>>
    label: Record<'L' | 'XS', RuleSet<object>>
  }
  fonts: {
    baseSize: number
    bodyFont: string
  }
  spacing: { verticalSpacer: { small: number; large: number } }
  zIndex: Record<'modal', number>
  helpers: {
    noLinkUnderline: ReturnType<typeof css>
    textBottomBorder: {
      shared: ReturnType<typeof css>
      after: (duration?: number) => ReturnType<typeof css>
      hoverAfter: ReturnType<typeof css>
      transform: (duration?: number) => ReturnType<typeof css>
    }
  }
  animation: {
    'clock-loading': Keyframes
  }
}
