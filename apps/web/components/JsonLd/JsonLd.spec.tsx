import { render, screen } from '@testing-library/react'

import { JsonLd } from './JsonLd'

describe('JsonLd', () => {
  it('renders a script tag with application/ld+json type and correct data', () => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Test User',
    }
    render(<JsonLd data={data} />)
    const script = screen.getByTestId('json-ld')
    expect(script).toHaveAttribute('type', 'application/ld+json')
    expect(JSON.parse(script.textContent ?? '')).toEqual(data)
  })
})
