import React from 'react'

export const Document = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="pdf-document">{children}</div>
)
export const Page = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="pdf-page">{children}</div>
)
export const View = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="pdf-view">{children}</div>
)
export const Text = ({ children }: { children: React.ReactNode }) => (
  <span data-testid="pdf-text">{children}</span>
)
export const Image = ({ src }: { src: string }) => (
  <img data-testid="pdf-image" src={src} alt="" />
)
export const Link = ({
  children,
  href,
  src,
}: {
  children?: React.ReactNode
  href?: string
  src?: string
}) => (
  <a data-testid="pdf-link" href={href ?? src}>
    {children}
  </a>
)

// SVG primitives — used by the canyon-report croquis. Rendered as inert
// elements so the report components mount in jsdom tests.
export const Svg = ({ children }: { children?: React.ReactNode }) => (
  <svg data-testid="pdf-svg">{children}</svg>
)
export const G = ({ children }: { children?: React.ReactNode }) => (
  <g data-testid="pdf-g">{children}</g>
)
export const Path = () => <path data-testid="pdf-path" />
export const Rect = ({ children }: { children?: React.ReactNode }) => (
  <rect data-testid="pdf-rect">{children}</rect>
)
export const Line = () => <line data-testid="pdf-line" />
export const Circle = () => <circle data-testid="pdf-circle" />
export const Polyline = () => <polyline data-testid="pdf-polyline" />
export const StyleSheet = {
  create: <T extends object>(styles: T): T => styles,
}
export const PDFDownloadLink = ({
  children,
}: {
  document: React.ReactNode
  fileName: string
  style?: object
  children: (state: { loading: boolean }) => React.ReactNode
}) => <>{children({ loading: false })}</>

export const Font = {
  register: () => undefined,
}

interface MockPdfInstance {
  url: string | null
  loading: boolean
  blob: null
  error: null
}

const DEFAULT_PDF: MockPdfInstance = {
  url: 'blob:mock-url',
  loading: false,
  blob: null,
  error: null,
}

let mockPdf: MockPdfInstance = { ...DEFAULT_PDF }

/** Test helper: override the instance the next `usePDF()` returns. */
export const __setMockPdf = (next: Partial<MockPdfInstance>) => {
  mockPdf = { ...DEFAULT_PDF, ...next }
}

/** Test helper: restore the default (ready) instance. */
export const __resetMockPdf = () => {
  mockPdf = { ...DEFAULT_PDF }
}

export const usePDF = () => [mockPdf, vi.fn()]
