import { fireEvent, render } from '@testing-library/react'

import { BLUR_UP_SCRIPT, BlurUpScript } from './BlurUpScript'

describe('BLUR_UP_SCRIPT', () => {
  beforeAll(() => {
    // Runs the inline script as the browser would.
    new Function(BLUR_UP_SCRIPT)()
  })

  function image(attributes: Record<string, string> = { 'data-blur-up': '' }) {
    const img = document.createElement('img')
    Object.entries(attributes).forEach(([k, v]) => img.setAttribute(k, v))
    document.body.appendChild(img)
    return img
  }

  it('flags a BlurUp image once it loads', () => {
    const img = image()
    fireEvent.load(img)
    expect(img).toHaveAttribute('data-loaded', '')
  })

  it('flags a BlurUp image that fails, so it does not stay hidden', () => {
    const img = image()
    fireEvent.error(img)
    expect(img).toHaveAttribute('data-loaded', '')
  })

  it('leaves other images and elements alone', () => {
    const img = image({})
    fireEvent.load(img)
    expect(img).not.toHaveAttribute('data-loaded')

    const div = document.createElement('div')
    div.setAttribute('data-blur-up', '')
    document.body.appendChild(div)
    fireEvent.load(div)
    expect(div).not.toHaveAttribute('data-loaded')
  })
})

describe('BlurUpScript', () => {
  // <script> and <noscript> have no accessible role to query them by.
  /* eslint-disable testing-library/no-container, testing-library/no-node-access */
  it('inlines the script and shows images without JavaScript', () => {
    const { container } = render(<BlurUpScript />)
    expect(container.querySelector('script')?.innerHTML).toBe(BLUR_UP_SCRIPT)
    expect(container.querySelector('noscript')).toBeInTheDocument()
  })
  /* eslint-enable testing-library/no-container, testing-library/no-node-access */
})
