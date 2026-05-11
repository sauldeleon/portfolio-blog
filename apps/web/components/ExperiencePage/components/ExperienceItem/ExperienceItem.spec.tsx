import { screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { ExperienceItem } from './ExperienceItem'

const defaultProps = {
  order: 0,
  company: 'test',
  technologies: ['nodeJS' as const],
  period: 'Feb 2022',
  link: 'https://www.test.com/',
  ariaLabel: 'Used technologies at test',
  checkWebsiteLabel: 'Check the website',
  paragraphs: [
    'Front-end React Developer.',
    'Including an <bold>EXPO</bold> mobile app for iOS and Android.',
  ],
}

describe('ExperienceItem', () => {
  it('should render successfully', () => {
    const { baseElement } = renderApp(<ExperienceItem {...defaultProps} />)
    expect(baseElement).toMatchSnapshot()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('Feb 2022')).toBeInTheDocument()
    expect(screen.getByLabelText('NodeJS')).toBeInTheDocument()
    expect(screen.getByText('EXPO')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Check the website/ }),
    ).toHaveAttribute('href', 'https://www.test.com/')
  })

  it('should render with end date period', () => {
    renderApp(<ExperienceItem {...defaultProps} period="Feb 2021 - Feb 2022" />)
    expect(screen.getByText('Feb 2021 - Feb 2022')).toBeInTheDocument()
  })

  it('should render without a link', () => {
    const { link: _link, ...propsWithoutLink } = defaultProps
    renderApp(<ExperienceItem {...propsWithoutLink} />)
    expect(
      screen.queryByRole('link', { name: /Check the website/ }),
    ).not.toBeInTheDocument()
  })
})
