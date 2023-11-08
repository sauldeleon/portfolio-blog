import { StyledSection } from './PortfolioItem.styles'

export interface PortfolioItemProps {
  title: string
}

export function PortfolioItem({ title }: PortfolioItemProps) {
  return <StyledSection>{title}</StyledSection>
}
