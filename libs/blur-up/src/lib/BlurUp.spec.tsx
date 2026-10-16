import { render, screen } from '@testing-library/react'

import { BlurUp, type BlurUpProps } from './BlurUp'

const PLACEHOLDER = 'https://res.cloudinary.com/x/image/upload/w_32/a.jpg'

function renderBlurUp(props: Partial<BlurUpProps> = {}) {
  return render(
    <BlurUp placeholder={PLACEHOLDER} {...props}>
      {(image) => <img src="/full.jpg" alt="Full" {...image} />}
    </BlurUp>,
  )
}

const fullImage = () => screen.getByAltText('Full')

describe('BlurUp', () => {
  it('renders the image as is without a placeholder', () => {
    renderBlurUp({ placeholder: undefined, imageStyle: { width: '100%' } })
    expect(screen.queryByTestId('blur-up')).not.toBeInTheDocument()
    expect(fullImage()).toHaveStyle({ width: '100%' })
  })

  it('passes object-fit through when filling', () => {
    renderBlurUp({ placeholder: undefined, fill: true, objectFit: 'contain' })
    expect(fullImage()).toHaveStyle({
      objectFit: 'contain',
      position: 'absolute',
      width: '100%',
      height: '100%',
    })
  })

  it('shows the blurred placeholder, hidden from assistive tech', () => {
    renderBlurUp()
    const placeholder = screen.getByTestId('blur-placeholder')
    expect(placeholder).toHaveAttribute('src', PLACEHOLDER)
    expect(placeholder).toHaveAttribute('alt', '')
    expect(placeholder).toHaveAttribute('aria-hidden', 'true')
  })

  it('marks the real image for BlurUpScript', () => {
    renderBlurUp({ imageStyle: { maxWidth: '1440px' } })
    expect(fullImage()).toHaveAttribute('data-blur-up', '')
    expect(fullImage()).toHaveStyle({ maxWidth: '1440px' })
  })

  it('keeps the image hidden until it is flagged loaded', () => {
    renderBlurUp()
    expect(screen.getByTestId('blur-up')).toHaveStyleRule('opacity', '0', {
      modifier: ':where(& > img[data-blur-up]:not([data-loaded]))',
    })
  })

  it('sizes to the image unless filling', () => {
    const { unmount } = renderBlurUp()
    expect(screen.getByTestId('blur-up')).toHaveStyleRule(
      'position',
      'relative',
    )
    expect(screen.getByTestId('blur-placeholder')).toHaveStyleRule(
      'height',
      'auto',
    )
    unmount()

    renderBlurUp({ fill: true, objectFit: 'contain' })
    expect(screen.getByTestId('blur-up')).toHaveStyleRule(
      'position',
      'absolute',
    )
    expect(screen.getByTestId('blur-placeholder')).toHaveStyleRule(
      'height',
      '100%',
    )
    // Scaling a contained copy would spill it beyond the picture.
    expect(screen.getByTestId('blur-placeholder')).toHaveStyleRule(
      'transform',
      'none',
    )
    expect(fullImage()).toHaveStyle({ objectFit: 'contain' })
  })

  it('matches snapshot', () => {
    const { container } = renderBlurUp()
    expect(container).toMatchSnapshot()
  })
})
