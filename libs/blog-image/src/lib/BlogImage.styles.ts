import styled, { css } from 'styled-components'

import type { BlogImagePosition } from './BlogImage'

export const StyledFigure = styled.figure<{ $position: BlogImagePosition }>`
  margin: 0;

  ${({ $position }) => {
    switch ($position) {
      case 'full':
        return css`
          width: 100%;
        `
      case 'center':
        return css`
          max-width: 600px;
          margin-inline: auto;
        `
      case 'left':
        return css`
          float: left;
          max-width: 300px;
          margin-right: 1rem;
          margin-bottom: 0.5rem;

          @media (max-width: 768px) {
            float: none;
            max-width: 100%;
          }
        `
      case 'right':
        return css`
          float: right;
          max-width: 300px;
          margin-left: 1rem;
          margin-bottom: 0.5rem;

          @media (max-width: 768px) {
            float: none;
            max-width: 100%;
          }
        `
    }
  }}
`

export const StyledCaption = styled.figcaption`
  font-size: 0.875rem;
  text-align: center;
  margin-top: 0.25rem;
`
