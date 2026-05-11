'use client'

import { parseRichText } from '@web/utils/parseRichText/parseRichText'

import {
  StyledAreaPeriod,
  StyledItalic,
  StyledLink,
  StyledList,
  StyledListItem,
} from './OtherStuff.styles'

const LINK_URL =
  'https://rd.springer.com/chapter/10.1007/978-3-642-21350-2_29#page-1'

type OtherStuffItem = {
  name: string
  period: string
  highlights: string[]
}

interface OtherStuffProps {
  items: OtherStuffItem[]
}

export function OtherStuff({ items }: OtherStuffProps) {
  return (
    <>
      {items.map(({ name, period, highlights }) => (
        <div key={name}>
          <StyledAreaPeriod>
            {parseRichText(name, {
              italic: (k, t) => <StyledItalic key={k}>{t}</StyledItalic>,
            })}{' '}
            {period}
          </StyledAreaPeriod>
          <StyledList>
            {highlights.map((highlight, i) => (
              <StyledListItem key={`${i}-${highlight}`}>
                {parseRichText(highlight, {
                  linkComponent: (k, t) => (
                    <StyledLink key={k} href={LINK_URL} target="_blank">
                      {t}
                    </StyledLink>
                  ),
                })}
              </StyledListItem>
            ))}
          </StyledList>
        </div>
      ))}
    </>
  )
}
