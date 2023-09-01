import { render, screen } from '@testing-library/react'

import RootLayout from './layout.next'

describe('RootLayout', () => {
  it('should render children', async () => {
    render(<RootLayout>test</RootLayout>)
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
