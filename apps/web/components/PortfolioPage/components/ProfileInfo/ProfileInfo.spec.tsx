import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ProfileInfo } from './ProfileInfo'

const mockAreas = [
  {
    icon: 'frontEnd',
    title: 'Front End',
    skills: ['SPA using <bold>React</bold> and <italic>TypeScript</italic>.'],
  },
]

describe('ProfileInfo', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(
      <ProfileInfo
        summary="Experienced Software Engineer."
        skillAreasTitle="Skills"
        areas={mockAreas}
      />,
    )
    expect(await screen.findByText('Skills')).toBeInTheDocument()
    expect(baseElement).toMatchSnapshot()
  })

  it('should render empty when areas is empty', () => {
    const { baseElement } = renderApp(
      <ProfileInfo summary="Summary" skillAreasTitle="Skills" areas={[]} />,
    )
    expect(baseElement).toBeTruthy()
  })
})
