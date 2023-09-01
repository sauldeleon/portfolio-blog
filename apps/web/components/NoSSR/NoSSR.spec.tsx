import { render } from '@testing-library/react'

import { NoSSR } from './NoSSR'

jest.mock('next/dynamic', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (...props: any) => {
    const dynamicModule = jest.requireActual('next/dynamic')
    const dynamicActualComp = dynamicModule.default
    const RequiredComponent = dynamicActualComp(props[0])
    RequiredComponent.preload
      ? RequiredComponent.preload()
      : RequiredComponent.render.preload()
    return RequiredComponent
  },
}))

describe('NoSSR', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NoSSR>test</NoSSR>)
    expect(baseElement).toMatchSnapshot()
  })
})
