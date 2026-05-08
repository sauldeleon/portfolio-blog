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
}: {
  children: React.ReactNode
  href: string
}) => (
  <a data-testid="pdf-link" href={href}>
    {children}
  </a>
)
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

export const usePDF = () => [
  { url: 'blob:mock-url', loading: false, blob: null, error: null },
  jest.fn(),
]
