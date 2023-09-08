import { screen } from '@testing-library/react'
import { css } from 'styled-components'

import { renderWithTheme } from '@sdlgr/test-utils'

import { AnimatedItem } from './AnimatedItem'

describe('AnimatedItem', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(
      <AnimatedItem
        svg={<svg />}
        rotate={false}
        path="https://google.com"
        ariaLabel="Google Chrome"
      />
    )
    expect(screen.getByRole('link')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render successfully image, colorSwap, rotation and custom size', () => {
    renderWithTheme(
      <AnimatedItem svg={<svg />} rotate={true} size="L" colorSwap />
    )

    expect(screen.getByTestId('horizontal-movement')).toHaveStyleRule(
      '--itemSize',
      '70px'
    )

    const rotationMovement = screen.getByTestId('rotation-movement')
    expect(rotationMovement).toHaveStyleRule(
      'background-image: url(/path/to/image.jpg)'
    )
    expect(rotationMovement).toHaveStyleRule(
      'animation-name',
      expect.stringMatching(/([a-zA-Z]+)/)
    )
    expect((rotationMovement.style as any)['animation-duration']).toMatch(
      /(\d{1,2}\.\d{14,16})s/
    )

    const colorSwapping = screen.getByTestId('color-swapping')
    expect(colorSwapping).toHaveStyleRule(
      'animation-name',
      expect.stringMatching(/([a-zA-Z]+)/)
    )
    expect((colorSwapping.style as any)['animation-duration']).toMatch(
      /(\d{1,2}\.\d{14,16})s/
    )
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
        svg={<svg />}
        rotate={true}
        size="S"
        customAnimation={customAnimation()}
      />
    )

    expect(screen.getByTestId('horizontal-movement')).toHaveStyleRule(
      'animation',
      'customHorizontal 6s linear infinite'
    )

    expect(screen.getByTestId('vertical-movement')).toHaveStyleRule(
      'animation',
      'customVertical 6s linear infinite'
    )
    expect(screen.getByTestId('rotation-movement')).toHaveStyleRule(
      'animation',
      'customRotate 6s linear infinite'
    )
  })
})
