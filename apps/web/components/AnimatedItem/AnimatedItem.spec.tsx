import { screen } from '@testing-library/react'
import { css } from 'styled-components'

import { renderWithTheme } from '@sdlgr/test-utils'

import { AnimatedItem } from './AnimatedItem'

describe('AnimatedItem', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithTheme(<AnimatedItem svg={<svg />} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render successfully image, colorSwap, rotation and custom size', () => {
    renderWithTheme(
      <AnimatedItem svg={<svg />} rotate={true} size="L" colorSwap />
    )

    expect(screen.getByTestId('horizontal-movement')).toHaveStyleRule(
      '--itemSize',
      '26%'
    )

    expect(screen.getByTestId('rotation-movement')).toHaveStyleRule(
      'background-image: url(/path/to/image.jpg)'
    )

    expect(screen.getByTestId('rotation-movement')).toHaveStyleRule(
      'animation',
      expect.stringMatching(/(\d+)s rotate-movement linear infinite/)
    )

    expect(screen.getByTestId('color-swapping')).toHaveStyleRule(
      'animation',
      expect.stringMatching(
        /(\d+\.?\d*)s color-swap (\d+\.?\d*)s linear infinite/
      ),
      { modifier: ' svg' }
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
