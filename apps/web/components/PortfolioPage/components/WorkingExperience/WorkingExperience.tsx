import { format } from 'date-fns/format'
import { useId } from 'react'
import { Trans } from 'react-i18next'

import { useExperienceItems } from '@web/components/ExperiencePage/useExperienceItems'
import { useClientTranslation } from '@web/i18n/client'

import {
  StyledCompanyName,
  StyledCompanyPeriod,
  StyledList,
  StyledListItem,
  StyledTechnology,
} from './WorkingExperience.styles'

export function WorkingExperience() {
  const experienceItems = useExperienceItems()
  const id = useId()
  const { t } = useClientTranslation('experiencePage')

  return (
    <>
      {experienceItems.map(
        ({ order, company, beginDate, endDate, descriptionParagraphKeys }) => (
          <div key={order}>
            <StyledCompanyName $level={2}>
              {company} - {t(descriptionParagraphKeys[0])}
            </StyledCompanyName>
            <StyledCompanyPeriod>
              {`${format(beginDate, 'MMMM yyyy')}${
                endDate ? format(endDate, ' - MMMM yyyy') : ''
              }`}
            </StyledCompanyPeriod>
            <StyledList>
              {descriptionParagraphKeys.slice(1).map((paragraphKey, index) => (
                <StyledListItem key={`${id}-${index}`}>
                  <Trans
                    t={t}
                    i18nKey={paragraphKey}
                    components={{
                      bold: <StyledTechnology />,
                    }}
                  />
                </StyledListItem>
              ))}
            </StyledList>
          </div>
        ),
      )}
    </>
  )
}
