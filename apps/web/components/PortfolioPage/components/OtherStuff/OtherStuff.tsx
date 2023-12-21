import { ParseKeys } from 'i18next'
import { useId } from 'react'
import { Trans } from 'react-i18next'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledAreaPeriod,
  StyledItalic,
  StyledLink,
  StyledList,
  StyledListItem,
} from './OtherStuff.styles'

export function OtherStuff() {
  const id = useId()
  const { t } = useClientTranslation('portfolioPage')
  const otherItems = t('items.other.otherAreas', { returnObjects: true })

  return (
    <>
      {otherItems.map(({ name, beginYear, endYear, highlights }, index) => (
        <div key={index}>
          <StyledAreaPeriod>
            <Trans
              t={t}
              i18nKey={name as ParseKeys<'portfolioPage'>}
              components={{
                italic: <StyledItalic />,
              }}
            />{' '}
            {`${beginYear ? beginYear : ''}${endYear ? ' - ' + endYear : ''}`}
          </StyledAreaPeriod>
          <StyledList>
            {highlights.map((highlight, index) => (
              <StyledListItem key={`${id}-${index}`}>
                <Trans
                  t={t}
                  i18nKey={highlight as ParseKeys<'portfolioPage'>}
                  components={{
                    linkComponent: (
                      <StyledLink
                        href="https://rd.springer.com/chapter/10.1007/978-3-642-21350-2_29#page-1"
                        target="_blank"
                      >
                        text
                      </StyledLink>
                    ),
                  }}
                />
              </StyledListItem>
            ))}
          </StyledList>
        </div>
      ))}
    </>
  )
}
