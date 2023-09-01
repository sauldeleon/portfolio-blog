import { renderWithTheme } from '@sdlgr/test-utils'

import { Body, Heading, Label } from './typography'

describe('Typography', () => {
  describe('Heading', () => {
    it('should render successfully', () => {
      const { baseElement } = renderWithTheme(<Heading>Test</Heading>)
      expect(baseElement).toBeTruthy()
    })
  })

  describe('Body', () => {
    it('should render successfully', () => {
      const { baseElement } = renderWithTheme(<Body>Test</Body>)
      expect(baseElement).toBeTruthy()
    })

    it('should render with centered prop successfully', () => {
      const { baseElement } = renderWithTheme(<Body $centered>Test</Body>)
      expect(baseElement).toBeTruthy()
    })
  })

  describe('Label', () => {
    it('should render successfully', () => {
      const { baseElement } = renderWithTheme(<Label>Test</Label>)
      expect(baseElement).toBeTruthy()
    })
  })
})
