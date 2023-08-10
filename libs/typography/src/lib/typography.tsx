import styled, { css } from 'styled-components'

type HeadingLevels = 1 | 2
interface HeadingProps {
  $level?: HeadingLevels
}

export const Heading = styled.h1<HeadingProps>`
  ${({
    theme: {
      typography: { heading },
    },
    $level = 1,
  }) => css`
    ${heading[`heading${$level}`]}
    margin: 0;
  `}
`

export type BodyLevel = 'L' | 'M' | 'S'
export type BodyProps = {
  $level?: BodyLevel
  $centered?: boolean
}
export const Body = styled.p<{
  $level?: BodyLevel
  $centered?: boolean
}>`
  ${({
    theme: {
      typography: { body },
    },
    $level = 'M',
    $centered = false,
  }) => css`
    ${body[$level]}
    white-space: pre-line;
    ${$centered &&
    css`
      text-align: center;
    `}
    ul, ol {
      margin-left: 40px;
      margin-bottom: 10px;
    }
    ul {
      list-style: outside disc;
    }
    ol {
      list-style: decimal;
    }
    li {
      padding-left: 10px;
    }
  `}
`

export type LabelLevel = 'L' | 'XS'
export type LabelProps = {
  $level?: LabelLevel
}
export const Label = styled.div<LabelProps>`
  ${({
    theme: {
      typography: { label },
    },
    $level = 'L',
  }) => css`
    ${label[$level]}
  `}
`
