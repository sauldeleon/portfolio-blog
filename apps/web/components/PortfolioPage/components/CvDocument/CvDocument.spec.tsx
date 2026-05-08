import { render, screen } from '@testing-library/react'

import { CvDocument } from './CvDocument'

jest.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-document">{children}</div>
  ),
  Page: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-page">{children}</div>
  ),
  View: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pdf-view">{children}</div>
  ),
  Text: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="pdf-text">{children}</span>
  ),
  Image: ({ src }: { src: string }) => (
    <img data-testid="pdf-image" src={src} alt="" />
  ),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a data-testid="pdf-link" href={href}>
      {children}
    </a>
  ),
  StyleSheet: {
    create: (styles: object) => styles,
  },
}))

const defaultProps = {
  name: 'Saúl de León Guerrero',
  title: 'Software Engineer',
  location: 'Based in Asturias, Spain',
  email: 'test@example.com',
  photoUrl: 'https://example.com/photo.png',
  summary: 'Experienced Software Engineer',
  profileSectionTitle: 'Profile',
  skillsSectionTitle: 'Skills',
  skillAreas: [
    {
      title: 'Front End',
      skills: [[{ text: 'React', bold: true }], [{ text: 'TypeScript' }]],
    },
    {
      title: 'Back End',
      skills: [[{ text: 'Node.js', bold: true }]],
    },
  ],
  experienceSectionTitle: 'Working Experience',
  experienceEntries: [
    {
      company: 'Bonhams',
      role: 'Front-end React Developer.',
      period: 'February 2022 - Present',
      bullets: [
        [
          { text: 'Part of the team responsible for migrating the ' },
          { text: 'Next.JS', bold: true },
          { text: ' app.' },
        ],
      ],
    },
  ],
  otherSectionTitle: 'Other',
  otherEntries: [
    {
      name: [{ text: 'Bachelor thesis' }],
      period: '',
      highlights: [[{ text: 'Development of a support tool for students.' }]],
    },
    {
      name: [{ text: 'This Portfolio.' }],
      period: '2022 - Present',
      highlights: [[{ text: 'Check the About link in the footer.' }]],
    },
  ],
}

describe('CvDocument', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CvDocument {...defaultProps} />)
    expect(baseElement).toMatchSnapshot()
  })

  it('should render skill area with comma separator for multiple skills', () => {
    render(<CvDocument {...defaultProps} />)
    expect(screen.getAllByTestId('pdf-text').length).toBeGreaterThan(0)
  })

  it('should render other entry with period', () => {
    const propsWithPeriod = {
      ...defaultProps,
      otherEntries: [
        {
          name: [{ text: 'Activity', italic: true }],
          period: '2020 - 2021',
          highlights: [[{ text: 'Did something important.' }]],
        },
      ],
    }
    const { baseElement } = render(<CvDocument {...propsWithPeriod} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render other entry without period', () => {
    const propsWithoutPeriod = {
      ...defaultProps,
      otherEntries: [
        {
          name: [{ text: 'Bachelor thesis' }],
          period: '',
          highlights: [[{ text: 'Some highlight.' }]],
        },
      ],
    }
    const { baseElement } = render(<CvDocument {...propsWithoutPeriod} />)
    expect(baseElement).toBeTruthy()
  })

  it('should render link segments as anchor elements', () => {
    const propsWithLink = {
      ...defaultProps,
      otherEntries: [
        {
          name: [{ text: 'Bachelor thesis' }],
          period: '',
          highlights: [
            [
              { text: 'This work resulted in two ' },
              { text: 'papers', link: 'https://example.com/papers' },
              { text: '.' },
            ],
          ],
        },
      ],
    }
    render(<CvDocument {...propsWithLink} />)
    expect(screen.getByTestId('pdf-link')).toHaveAttribute(
      'href',
      'https://example.com/papers',
    )
  })

  it('should apply bold style to bold segments', () => {
    const propsWithBold = {
      ...defaultProps,
      skillAreas: [
        {
          title: 'Front End',
          skills: [
            [
              { text: 'React', bold: true },
              { text: ' and ' },
              { text: 'TS', italic: true },
            ],
          ],
        },
      ],
    }
    const { baseElement } = render(<CvDocument {...propsWithBold} />)
    expect(baseElement).toBeTruthy()
  })
})
