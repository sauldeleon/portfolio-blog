import { renderApp } from '@sdlgr/test-utils'

import { ExperienceNav } from './ExperienceNav'

const mockEntries = [
  { id: 'bonhams', text: 'Bonhams', depth: 2 },
  { id: 'smart-protection', text: 'Smart Protection', depth: 2 },
]

describe('ExperienceNav', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(
      <ExperienceNav entries={mockEntries} label="Jump to" />,
    )
    expect(baseElement).toMatchSnapshot()
  })
})
