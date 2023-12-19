import {
  BackendIcon,
  DatabaseIcon,
  FileIcon,
  FrontendIcon,
  MobileIcon,
} from '@sdlgr/assets'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledLabel,
  StyledList,
  StyledListItem,
  StyledSkillGroup,
  StyledSkillTitle,
  StyledSummary,
} from './ProfileInfo.styles'

const icons: Record<string, React.ReactElement> = {
  frontEnd: <FrontendIcon width={20} height={20} />,
  backEnd: <BackendIcon width={20} height={20} />,
  mobile: <MobileIcon width={20} height={20} />,
  database: <DatabaseIcon width={20} height={20} />,
  other: <FileIcon width={20} height={20} />,
}

export function ProfileInfo() {
  const { t } = useClientTranslation('portfolioPage')

  const skillSections = t('items.profile.skills.items', { returnObjects: true })

  return (
    <>
      <StyledSummary $level="XL">{t('items.profile.summary')}</StyledSummary>
      <StyledLabel>{t('items.profile.skills.title')}</StyledLabel>
      {skillSections.map(({ icon, title, items }) => (
        <StyledSkillGroup key={icon}>
          <StyledSkillTitle>
            {icons[icon]}
            {title}
          </StyledSkillTitle>
          <StyledList>
            {items.map((item) => (
              <StyledListItem key={item}>{item}</StyledListItem>
            ))}
          </StyledList>
        </StyledSkillGroup>
      ))}
    </>
  )
}
