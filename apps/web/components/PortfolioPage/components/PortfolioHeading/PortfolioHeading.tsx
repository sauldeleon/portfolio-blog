import { useClientTranslation } from '@web/i18n/client'

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

export function PortfolioHeading() {
  const { t } = useClientTranslation('portfolioPage')
  return (
    <StyledSection>
      <StyledFirstRow>
        <StyledDegree>{t('items.softwareEngineer')}</StyledDegree>
        <StyledInfo>
          <StyledBody>{t('basedIn')}</StyledBody>
          <StyledBody>sauldeleonguerrero@gmail.com</StyledBody>
        </StyledInfo>
      </StyledFirstRow>
      <StyledRow>
        <StyledPortrait
          src="/assets/portrait-4.png"
          width={310}
          height={310}
          alt={t('profilePicture')}
        />
        <StyledHeading $level={1}>Saúl de León Guerrero</StyledHeading>
      </StyledRow>
    </StyledSection>
  )
}
