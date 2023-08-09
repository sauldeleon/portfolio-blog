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
  white: '#FFFFFF',
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
  },
  animation: {
    rotate360: keyframes`
      0% {
        transform: rotate(0deg)
      }
      100% {
        transform: rotate(360deg)
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
    body: Record<'L' | 'M' | 'S', RuleSet<object>>
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
  }
  animation: {
    rotate360: Keyframes
  }
}
