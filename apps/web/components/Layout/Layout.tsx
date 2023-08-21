import { StyledContent, StyledPage } from './Layout.styles'
import { Footer } from './components/Footer/Footer'
import { Header } from './components/Header/Header'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <StyledPage>
      <Header />
      <StyledContent>{children}</StyledContent>
      <Footer />
    </StyledPage>
  )
}
