import { screen } from '@testing-library/react'
import { useEffect, useRef } from 'react'

import {
  getAllByAttribute,
  getAllByTagAndText,
  getByAttribute,
  getByClassName,
  getById,
  getByTagAndText,
  mockRandom,
  queryAllByAttribute,
  queryByAttribute,
  render,
  useWithRefreshInTest,
} from './test-utils'

describe('test-utils', () => {
  it('queryByAttribute and getByAttribute', () => {
    const { baseElement } = render(
      <div>
        <span data-target={true}>content</span>
      </div>,
    )

    expect(
      getByAttribute('data-target')(baseElement, 'true'),
    ).toBeInTheDocument()
    expect(
      queryByAttribute('data-target')(baseElement, 'false'),
    ).not.toBeInTheDocument()
  })
  it('queryAllByAttribute and getAllByAttribute', () => {
    const { baseElement } = render(
      <div>
        <span data-target={true}>content</span>
        <span data-target={true}>content2</span>
      </div>,
    )

    expect(getAllByAttribute('data-target')(baseElement, 'true')).toHaveLength(
      2,
    )
    expect(
      queryAllByAttribute('data-target')(baseElement, 'false'),
    ).toHaveLength(0)
  })
  it('getById', () => {
    const { baseElement } = render(
      <div>
        <span id="target">content</span>
      </div>,
    )

    expect(getById(baseElement, 'target')).toBeInTheDocument()
  })
  it('getByClassName', () => {
    const { baseElement } = render(
      <div>
        <span className="target">content</span>
      </div>,
    )

    expect(getByClassName(baseElement, 'target')).toBeInTheDocument()
  })
  it('getByTagAndText', () => {
    render(
      <div>
        <div>content</div>
        <div>content</div>
        <span>content</span>
        <div>content</div>
      </div>,
    )

    expect(getByTagAndText('span', /content/)).toBeInTheDocument()
  })
  it('getByTagAndText using function', () => {
    render(
      <div>
        <div>content</div>
        <div>content</div>
        <span>content</span>
        <div>content</div>
      </div>,
    )

    expect(
      getByTagAndText('span', (content) => content.startsWith('cont')),
    ).toBeInTheDocument()
  })
  it('getAllByTagAndText', () => {
    render(
      <div>
        <div>content</div>
        <div>content</div>
        <span>content</span>
        <div>content</div>
      </div>,
    )

    expect(getAllByTagAndText('div', /content/)).toHaveLength(3)
  })

  it('mockRandom', () => {
    mockRandom(0.1234)
    expect(Math.random()).toEqual(0.1234)
  })

  it('mockRandom', () => {
    mockRandom()
    const first = Math.random()
    const second = Math.random()
    expect(first).toEqual(second)
  })

  describe('useWithRefreshInTest', () => {
    it('not using useWithRefreshInTest', () => {
      function MockComponentWithoutRefresh() {
        const ref = useRef('initial')

        useEffect(() => {
          ref.current = 'updated'
        }, [])

        return <div>{ref.current}</div>
      }

      render(<MockComponentWithoutRefresh />)

      expect(screen.getByText('initial')).toBeInTheDocument()
      expect(screen.queryByText('updated')).not.toBeInTheDocument()
    })
    it('using useWithRefreshInTest', async () => {
      function MockComponentWithRefresh() {
        useWithRefreshInTest()
        const ref = useRef('initial')

        useEffect(() => {
          ref.current = 'updated'
        }, [])

        return <div>{ref.current}</div>
      }

      render(<MockComponentWithRefresh />)

      expect(screen.queryByText('initial')).not.toBeInTheDocument()
      expect(screen.getByText('updated')).toBeInTheDocument()
    })
  })
})
