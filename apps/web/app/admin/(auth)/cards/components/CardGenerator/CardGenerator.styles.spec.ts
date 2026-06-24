import React from 'react'

import { renderApp } from '@sdlgr/test-utils'

import {
  StyledCardTypeRow,
  StyledLayout,
  StyledPanelForm,
  StyledPanelPreview,
  StyledTitle,
  StyledWrapper,
} from './CardGenerator.styles'

describe('CardGenerator.styles', () => {
  it('renders StyledWrapper', () => {
    const { container } = renderApp(React.createElement(StyledWrapper))
    expect(container.firstChild).toBeTruthy()
  })

  it('renders StyledTitle', () => {
    const { container } = renderApp(React.createElement(StyledTitle))
    expect(container.firstChild).toBeTruthy()
  })

  it('renders StyledCardTypeRow', () => {
    const { container } = renderApp(React.createElement(StyledCardTypeRow))
    expect(container.firstChild).toBeTruthy()
  })

  it('renders StyledLayout', () => {
    const { container } = renderApp(React.createElement(StyledLayout))
    expect(container.firstChild).toBeTruthy()
  })

  it('renders StyledPanelForm', () => {
    const { container } = renderApp(React.createElement(StyledPanelForm))
    expect(container.firstChild).toBeTruthy()
  })

  it('renders StyledPanelPreview', () => {
    const { container } = renderApp(React.createElement(StyledPanelPreview))
    expect(container.firstChild).toBeTruthy()
  })
})
