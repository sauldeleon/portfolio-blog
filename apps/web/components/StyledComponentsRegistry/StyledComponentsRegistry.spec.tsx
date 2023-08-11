import { render } from '@testing-library/react'

import StyledComponentsRegistry from './StyledComponentsRegistry'

describe('StyledComponentsRegistry', () => {
  it('should render children successfully', () => {
    const { baseElement } = render(
      <StyledComponentsRegistry>test</StyledComponentsRegistry>
    )

    expect(baseElement).toMatchInlineSnapshot(`
      <body>
        <div>
          test
        </div>
      </body>
    `)
  })
})
