import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import Page, { generateMetadata, generateStaticParams } from './page.next'

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
  }),
}))

describe('[lng] route - Page', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<Page />)
    const items = await screen.findAllByRole('presentation')
    expect(items).toHaveLength(2)
    expect(baseElement).toMatchSnapshot()
  })
})

describe('[lng] route - static params', () => {
  it('should generate static params successfully', async () => {
    const params = await generateStaticParams()
    expect(params).toEqual([
      {
        lng: 'en',
      },
      {
        lng: 'es',
      },
    ])
  })
})

describe('[lng] route - metadata', () => {
  it('should generate dynamic metadata successfully', async () => {
    const metadata = await generateMetadata({})
    expect(metadata).toEqual({
      description: 'My personal Portfolio',
      title: 'Saúl de León Guerrero',
    })
  })
})
