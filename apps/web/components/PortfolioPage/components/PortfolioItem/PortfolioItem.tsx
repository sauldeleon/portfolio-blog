import {
  StyledContainer,
  StyledSection,
  StyledTitle,
} from './PortfolioItem.styles'

export interface PortfolioItemProps {
  title: string
  children: React.ReactNode
}

export function PortfolioItem({
  title,
  children,
}: Readonly<PortfolioItemProps>) {
  return (
    <StyledSection>
      <StyledTitle $level="L">{title}</StyledTitle>
      <StyledContainer>{children}</StyledContainer>
    </StyledSection>
  )
}
