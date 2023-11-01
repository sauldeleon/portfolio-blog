import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ExperienceItem } from './ExperienceItem'

describe('ExperienceItem', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderApp(
      <ExperienceItem
        order={0}
        company="test"
        technologies={['nodeJS']}
        beginDate={new Date('2022-02-01T00:00:00.000Z')}
        link="https://www.test.com/"
        descriptionParagraphKeys={[
          'experienceItems.bonhams.p1',
          'experienceItems.bonhams.p2',
        ]}
      />,
    )
    await screen.findByText('Check the website')
    expect(baseElement).toMatchSnapshot()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('Feb 2022')).toBeInTheDocument()
    expect(screen.getByLabelText('NodeJS')).toBeInTheDocument()
    expect(screen.getByText(/EXPO/)).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: /Check the website/,
      }),
    ).toHaveAttribute('href', 'https://www.test.com/')
  })

  it('should render with end date', async () => {
    renderApp(
      <ExperienceItem
        order={0}
        company="test"
        technologies={['nodeJS']}
        beginDate={new Date('2021-02-01T00:00:00.000Z')}
        endDate={new Date('2022-02-01T00:00:00.000Z')}
        link="https://www.test.com/"
        descriptionParagraphKeys={[
          'experienceItems.bonhams.p1',
          'experienceItems.bonhams.p2',
        ]}
      />,
    )
    await screen.findByText('Check the website')
    expect(await screen.findByText('Feb 2021 - Feb 2022')).toBeInTheDocument()
  })
})
