import { render } from '@testing-library/react'

import { NoSSR } from './NoSSR'

vi.mock('next/dynamic', async () => {
  const dynamicModule = await vi.importActual<any>('next/dynamic')
  return {
    __esModule: true,

    default: (...props: any) => {
      const dynamicActualComp = dynamicModule.default
      const RequiredComponent = dynamicActualComp(props[0])
      RequiredComponent.preload
        ? RequiredComponent.preload()
        : RequiredComponent.render.preload()
      return RequiredComponent
    },
  }
})

describe('NoSSR', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NoSSR>test</NoSSR>)
    expect(baseElement).toMatchSnapshot()
  })
})
