import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { MainPortal } from './MainPortal'

describe('MainPortal', () => {
  it('should render', () => {
    renderApp(<MainPortal />)
    expect(screen.getAllByText('portal.svg')).toHaveLength(2)
  })

  it('should pass children', () => {
    renderApp(<MainPortal>test</MainPortal>)
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
