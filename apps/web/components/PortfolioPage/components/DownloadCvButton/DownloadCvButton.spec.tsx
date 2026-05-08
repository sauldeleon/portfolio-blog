import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderApp } from '@sdlgr/test-utils'

import { CvDocumentProps } from '../CvDocument/CvDocument'
import { DownloadCvButton } from './DownloadCvButton'

const mockUpdate = jest.fn()
const mockUsePDF = jest.fn()

jest.mock('@react-pdf/renderer', () => ({
  usePDF: (...args: unknown[]) => mockUsePDF(...args),
  Document: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
  Image: ({ src }: { src: string }) => <img src={src} alt="" />,
  StyleSheet: { create: (s: object) => s },
}))

const cvData: Omit<CvDocumentProps, 'photoUrl'> = {
  name: 'Saúl de León Guerrero',
  title: 'Software Engineer',
  location: 'Based in Asturias, Spain',
  email: 'test@example.com',
  summary: 'Experienced developer.',
  profileSectionTitle: 'Profile',
  skillsSectionTitle: 'Skills',
  skillAreas: [],
  experienceSectionTitle: 'Working Experience',
  experienceEntries: [],
  otherSectionTitle: 'Other',
  otherEntries: [],
}

const defaultProps = {
  lng: 'en',
  cvData,
  photoPath: '/assets/portrait-4.png',
  downloadLabel: 'Download CV',
  generatingLabel: 'Generating...',
  filename: 'CV-SaulDeLeonGuerrero-en.pdf',
}

describe('DownloadCvButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePDF.mockReturnValue([
      { url: 'blob:mock-url', loading: false, blob: null, error: null },
      mockUpdate,
    ])
  })

  it('should render disabled when PDF not yet generated', () => {
    mockUsePDF.mockReturnValue([
      { url: null, loading: false, blob: null, error: null },
      mockUpdate,
    ])
    const { baseElement } = renderApp(<DownloadCvButton {...defaultProps} />)
    expect(baseElement).toMatchSnapshot()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should enable button when PDF is ready', async () => {
    renderApp(<DownloadCvButton {...defaultProps} />)
    expect(
      await screen.findByRole('button', { name: /Download CV/ }),
    ).not.toBeDisabled()
  })

  it('should show generating label while loading', async () => {
    mockUsePDF.mockReturnValue([
      { url: 'blob:mock-url', loading: true, blob: null, error: null },
      mockUpdate,
    ])
    renderApp(<DownloadCvButton {...defaultProps} />)
    expect(await screen.findByText('Generating...')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should call update when photoUrl is set after mount', async () => {
    renderApp(<DownloadCvButton {...defaultProps} />)
    await screen.findByRole('button')
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('should trigger download on click', async () => {
    renderApp(<DownloadCvButton {...defaultProps} />)
    const button = await screen.findByRole('button', { name: /Download CV/ })

    const mockClick = jest.fn()
    const mockAnchor = {
      href: '',
      download: '',
      click: mockClick,
    } as unknown as HTMLAnchorElement

    const mockAppend = jest
      .spyOn(document.body, 'appendChild')
      .mockReturnValue(mockAnchor as unknown as Node)
    const mockRemove = jest
      .spyOn(document.body, 'removeChild')
      .mockReturnValue(mockAnchor as unknown as Node)
    const originalCreateElement = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'a') return mockAnchor
      return originalCreateElement(tag)
    })

    await userEvent.click(button)

    expect(mockClick).toHaveBeenCalled()
    expect(mockAppend).toHaveBeenCalledWith(mockAnchor)
    expect(mockRemove).toHaveBeenCalledWith(mockAnchor)

    mockAppend.mockRestore()
    mockRemove.mockRestore()
    ;(document.createElement as jest.Mock).mockRestore()
  })

  it('should not trigger download when url is null', async () => {
    mockUsePDF.mockReturnValue([
      { url: null, loading: false, blob: null, error: null },
      mockUpdate,
    ])
    renderApp(<DownloadCvButton {...defaultProps} />)
    expect(screen.getByRole('button', { name: /Download CV/ })).toBeDisabled()
  })
})
