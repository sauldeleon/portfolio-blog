import { ParseKeys } from 'i18next'
import { Trans } from 'react-i18next'

import {
  BackendIcon,
  DatabaseIcon,
  FileIcon,
  FrontendIcon,
  MobileIcon,
} from '@sdlgr/assets'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledItalic,
  StyledLabel,
  StyledList,
  StyledListItem,
  StyledSkillGroup,
  StyledSkillTitle,
  StyledSummary,
  StyledTechnology,
} from './ProfileInfo.styles'

const iconMap: Record<string, React.ReactElement> = {
  frontEnd: <FrontendIcon width={20} height={20} />,
  backEnd: <BackendIcon width={20} height={20} />,
  mobile: <MobileIcon width={20} height={20} />,
  database: <DatabaseIcon width={20} height={20} />,
  other: <FileIcon width={20} height={20} />,
}

export function ProfileInfo() {
  const { t } = useClientTranslation('portfolioPage')

  const areas = t('items.profile.skillAreas.areas', {
    returnObjects: true,
  })

  return (
    <>
      <StyledSummary $level="XL">{t('items.profile.summary')}</StyledSummary>
      <StyledLabel>{t('items.profile.skillAreas.title')}</StyledLabel>
      {areas.map(({ icon, title, skills }) => (
        <StyledSkillGroup key={icon}>
          <StyledSkillTitle>
            {iconMap[icon]}
            {title}
          </StyledSkillTitle>
          <StyledList>
            {skills.map((skill) => (
              <StyledListItem key={skill}>
                <Trans
                  t={t}
                  i18nKey={skill as ParseKeys<'portfolioPage'>}
                  components={{
                    bold: <StyledTechnology />,
                    italic: <StyledItalic />,
                  }}
                />
              </StyledListItem>
            ))}
          </StyledList>
        </StyledSkillGroup>
      ))}
    </>
  )
}
