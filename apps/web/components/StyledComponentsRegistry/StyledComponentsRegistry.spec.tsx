import { render, screen } from '@testing-library/react'

import StyledComponentsRegistry from './StyledComponentsRegistry'

describe('StyledComponentsRegistry', () => {
  it('should render children successfully', async () => {
    const { baseElement } = render(
      <StyledComponentsRegistry>test</StyledComponentsRegistry>,
    )

    await screen.findByText('test')
    expect(baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          test
        </div>
      </body>
    `)
  })
})
