import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { WorkingExperience } from './WorkingExperience'

describe('WorkingExperience', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(<WorkingExperience />)
    expect(
      await screen.findByText(/Part of the team responsible for migrating/),
    ).toBeInTheDocument()

    expect(baseElement).toMatchSnapshot()
  })
})
