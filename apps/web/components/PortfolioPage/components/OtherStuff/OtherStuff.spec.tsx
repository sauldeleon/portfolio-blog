import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { OtherStuff } from './OtherStuff'

const mockItems = [
  {
    name: 'Bachelor thesis',
    period: '',
    highlights: [
      'Development of a support tool for students.',
      'This work resulted in two <linkComponent>papers</linkComponent>.',
    ],
  },
  {
    name: 'Collaborative activities with the <italic>DSIC</italic> department.',
    period: '2011 - 2012',
    highlights: ['Maintenance of the Virtual Area.'],
  },
]

describe('OtherStuff', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<OtherStuff items={mockItems} />)
    expect(await screen.findByText('Bachelor thesis')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render empty when items is empty', () => {
    const { baseElement } = renderApp(<OtherStuff items={[]} />)
    expect(baseElement).toBeTruthy()
  })
})
