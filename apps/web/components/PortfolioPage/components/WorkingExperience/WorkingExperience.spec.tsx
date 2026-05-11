import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { WorkingExperience } from './WorkingExperience'

const mockItems = [
  {
    order: 0,
    company: 'Bonhams',
    role: 'Senior Front-End Engineer',
    period: 'February 2022',
    bullets: [
      'Part of the team responsible for migrating the <bold>legacy</bold> platform.',
    ],
  },
  {
    order: 1,
    company: 'Smart Protection',
    role: 'Front-End Engineer',
    period: 'February 2021 - February 2022',
    bullets: ['Worked on the design system.'],
  },
]

describe('WorkingExperience', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<WorkingExperience items={mockItems} />)
    expect(
      await screen.findByText(/Part of the team responsible for migrating/),
    ).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })
})
