import * as React from 'react'
import { css, keyframes } from 'styled-components'
import { Keyframes, RuleSet } from 'styled-components/dist/types'

import { Roboto_Mono } from 'next/font/google'
import { SLLogo, SLLogoSVG } from '@sdlgr/assets'

const baseFontSize = 20

const rounded = (calc: number) => (calc >> 0 === calc ? calc : +calc.toFixed(5))
const fontSize = (px: number) => `${rounded(px / baseFontSize)}rem`
const getDownMedia = (size: number) => `@media (width <= ${size - 1}px)`
const getUpMedia = (size: number) => `@media (width >= ${size}px)`

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

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['100', '300', '400', '500'],
  fallback: ['monospace'],
})

const fontFamilies: Record<'robotoMono', string> = {
  robotoMono: robotoMono.style.fontFamily,
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

const bottomBorderIncrease = css`
  transform: scaleX(1);
  transform-origin: bottom left;
`

const bottomBorderAfterInitial = (duration: number) => css`
  &::after {
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform ${duration}s ease-out;
  }
`

const gradientShared = css`
  border: 1px solid;
  border-image-slice: 1;
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
    focusVisible: css`
      &:focus-visible {
        outline: ${colors.white} auto 1px;
      }
    `,
    textBottomBorder: {
      removeAfter: css`
        &:after {
          content: none;
        }
        &:hover {
          &:after {
            content: none;
          }
        }
      `,
      afterShared: css`
        position: relative;
        &::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: currentColor;
        }
      `,
      afterInitial: (duration = 0.25) => bottomBorderAfterInitial(duration),
      afterIncrease: css`
        &::after {
          ${bottomBorderIncrease}
        }
      `,
      transform: (duration = 0.25) => css`
        ${bottomBorderAfterInitial(duration)}
        &:hover::after {
          ${bottomBorderIncrease}
        }
      `,
    },
    border: {
      gradientShared,
      gradientRight: css`
        border-image-source: linear-gradient(
          to right,
          ${colors.yellow},
          ${colors.green}
        );
      `,
      gradientBottom: css`
        border-image-source: linear-gradient(
          to bottom,
          ${colors.yellow},
          ${colors.green}
        );
      `,
    },
  },
  animation: {
    particleMovement: keyframes`
      from {
        transform: translate(-50%, var(--begin-y));
      }
      to {
        transform: translate(50%, var(--end-y));
      }
    `,
    particleFade: keyframes`
      0% {
        opacity: 1;
      }

      50% {
        opacity: 0.7;
      }

      100% {
        opacity: 1;
      }
    `,
    particleScale: keyframes`
      0% {
        transform: scale3d(0.4, 0.4, 1);
      }

      50% {
        transform: scale3d(1, 1, 1);
      }

      100% {
        transform: scale3d(0.4, 0.4, 1);
      }
    `,
    portalGlow: keyframes`
      0% {
        box-shadow: inset 0px 0px 13px 1px var(--portal-glow-color);
      }
      50% {
        box-shadow: inset 0px 0px 20px 1px var(--portal-glow-color);
      }
      100% {
        box-shadow: inset 0px 0px 13px 1px var(--portal-glow-color);
      }
    `,
    colorSwap: keyframes`
      from {
        color: ${colors.yellow};
      }
      to {
        color: ${colors.green};
      }
    `,
    horizontalMovement: keyframes`
      0% {
        transform: translateX(var(--translateX-begin));
      }
      100% {
        transform: translateX(var(--translateX-end));
      }
    `,
    verticalMovement: keyframes`
      0% {
        transform: translateY(var(--translateY-begin));
      }
      100% {
        transform: translateY(var(--translateY-end));
      }
    `,
    rotateMovement: keyframes`
      from {
        rotate: 0deg;
      }
      to {
        rotate: var(--rotation);
      }
    `,
    moveToothFall: keyframes`
      0% {
      	top: -30px;
      }
      100% {
        top: 200%;
      }
    `,
    moveToothHorizontal: keyframes`
      0% {
        left: 0;
      }
      100% {
        left: -65%;
      }
    `,
    moveToothVertical: keyframes`
      100% {
        top: var(--final-tooth-top);
      }
    `,
    moveToothRotate: keyframes`
      0% {
        transform: rotate(180deg);
      }
      100% {
        transform: rotate(${2 * 360 + 180}deg);
      }
    `,
    toothRemove: keyframes`
      100% {
        opacity: 1;
      }
    `,
  },
}

type MediaSize = 'sm' | 'md' | 'lg' | 'xl'

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
          title?: string
        }
      >
    >
    svg: string
  }
  breakpoints: Record<MediaSize, number>
  media: {
    down: Record<MediaSize, string>
    up: Record<MediaSize, string>
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
    focusVisible: ReturnType<typeof css>
    textBottomBorder: {
      removeAfter: ReturnType<typeof css>
      afterShared: ReturnType<typeof css>
      afterInitial: (duration?: number) => ReturnType<typeof css>
      afterIncrease: ReturnType<typeof css>
      transform: (duration?: number) => ReturnType<typeof css>
    }
    border: {
      gradientShared: ReturnType<typeof css>
      gradientRight: ReturnType<typeof css>
      gradientBottom: ReturnType<typeof css>
    }
  }
  animation: {
    particleMovement: Keyframes
    particleFade: Keyframes
    particleScale: Keyframes
    portalGlow: Keyframes
    colorSwap: Keyframes
    horizontalMovement: Keyframes
    verticalMovement: Keyframes
    rotateMovement: Keyframes
    moveToothFall: Keyframes
    moveToothHorizontal: Keyframes
    moveToothVertical: Keyframes
    moveToothRotate: Keyframes
    toothRemove: Keyframes
  }
}
