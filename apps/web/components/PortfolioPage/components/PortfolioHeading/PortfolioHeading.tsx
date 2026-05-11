'use client'

import {
  StyledBody,
  StyledDegree,
  StyledFirstRow,
  StyledHeading,
  StyledInfo,
  StyledPortrait,
  StyledRow,
  StyledSection,
} from './PortfolioHeading.styles'

interface PortfolioHeadingProps {
  softwareEngineer: string
  basedIn: string
  profilePicture: string
}

export function PortfolioHeading({
  softwareEngineer,
  basedIn,
  profilePicture,
}: PortfolioHeadingProps) {
  return (
    <StyledSection>
      <StyledFirstRow>
        <StyledDegree>{softwareEngineer}</StyledDegree>
        <StyledInfo>
          <StyledBody>{basedIn}</StyledBody>
          <StyledBody>sauldeleonguerrero@gmail.com</StyledBody>
        </StyledInfo>
      </StyledFirstRow>
      <StyledRow>
        <StyledPortrait
          src="/assets/portrait-4.png"
          width={310}
          height={310}
          alt={profilePicture}
        />
        <StyledHeading $level={1}>Saúl de León Guerrero</StyledHeading>
      </StyledRow>
    </StyledSection>
  )
}
