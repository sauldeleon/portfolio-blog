import { renderToString } from 'react-dom/server'

import RootLayout, {
  generateMetadata,
  generateStaticParams,
} from './layout.next'

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
  }),
}))

describe('[lng] route - layout', () => {
  it('should render successfully in English', () => {
    const view = renderToString(
      <RootLayout params={{ lng: 'en' }}>test</RootLayout>
    )

    expect(view).toContain('test')
    expect(view).toContain(`<html lang="en" dir="ltr"`)
  })

  it('should render successfully in Spanish', () => {
    const view = renderToString(
      <RootLayout params={{ lng: 'es' }}>test</RootLayout>
    )

    expect(view).toContain('test')
    expect(view).toContain(`<html lang="es" dir="ltr"`)
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
