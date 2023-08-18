/* eslint-disable testing-library/no-node-access */
import { screen } from '@testing-library/react'
import { css } from 'styled-components'

import { renderWithTheme } from '@sdlgr/test-utils'

import { AnimatedItem } from './AnimatedItem'

const mockSeeds = {
  keyframe: 'keyframe',
  verticalStartPoint: 'verticalStartPoint',
  horizontalDuration: 'horizontalDuration',
  horizontalDelay: 'horizontalDelay',
  verticalZIndex: 'verticalZIndex',
  verticalDuration: 'verticalDuration',
  verticalDelay: 'verticalDelay',
  verticalRange: 'verticalRange',
  verticalColor: 'verticalColor',
  rotationZIndex: 'rotationZIndex',
  rotationColor: 'rotationColor',
  rotationDuration: 'rotationDuration',
  rotationDelay: 'rotationDelay',
}

describe('AnimatedItem', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(
      <AnimatedItem
        id="id"
        seeds={mockSeeds}
        parentWidth={300}
        parentHeight={200}
      />
    )
    expect(baseElement).toMatchSnapshot()
  })

  it('should render successfully with a path image', () => {
    renderWithTheme(
      <AnimatedItem
        id="id"
        seeds={mockSeeds}
        parentWidth={300}
        parentHeight={200}
        path="/path/to/image.jpg"
      />
    )
    expect(screen.getByRole('presentation').firstChild).toHaveStyleRule(
      'background-image: url(/path/to/image.jpg)'
    )
  })

  it('should render successfully with a rotation and a custom size', () => {
    renderWithTheme(
      <AnimatedItem
        id="id"
        seeds={mockSeeds}
        parentWidth={300}
        parentHeight={200}
        path="/path/to/image.jpg"
        rotate={true}
        size={100}
      />
    )

    expect(screen.getByRole('none')).toHaveStyleRule(
      'animation',
      expect.stringMatching(/(\d+)s rotate-id linear infinite/)
    )
    expect(screen.getByRole('presentation')).toHaveStyleRule('--size', '100px')
  })

  it('should render successfully with a rotation and no path', () => {
    renderWithTheme(
      <AnimatedItem
        id="id"
        seeds={mockSeeds}
        parentWidth={300}
        parentHeight={200}
        rotate={true}
      />
    )

    expect(screen.getByRole('none')).toHaveStyleRule('background', '#14ed15')
  })

  it('should render successfully with a custom animation', () => {
    const customAnimation = () => ({
      horizontal: css`
        animation: customHorizontal 6s linear infinite;
      `,
      vertical: css`
        animation: customVertical 6s linear infinite;
      `,
      rotate: css`
        animation: customRotate 6s linear infinite;
      `,
    })

    renderWithTheme(
      <AnimatedItem
        id="id"
        seeds={mockSeeds}
        parentWidth={300}
        parentHeight={200}
        rotate={true}
        path="/test.jpg"
        customAnimation={customAnimation()}
      />
    )

    expect(screen.getByRole('presentation')).toHaveStyleRule(
      'animation',
      'customHorizontal 6s linear infinite'
    )

    const rotationItem = screen.getByRole('none')
    expect(rotationItem.parentElement).toHaveStyleRule(
      'animation',
      'customVertical 6s linear infinite'
    )
    expect(rotationItem).toHaveStyleRule(
      'animation',
      'customRotate 6s linear infinite'
    )
  })
})