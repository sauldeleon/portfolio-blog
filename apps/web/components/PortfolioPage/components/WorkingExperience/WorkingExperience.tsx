'use client'

import { parseRichText } from '@web/utils/parseRichText/parseRichText'

import {
  StyledCompanyName,
  StyledCompanyPeriod,
  StyledList,
  StyledListItem,
  StyledTechnology,
} from './WorkingExperience.styles'

type WorkingExperienceItem = {
  order: number
  company: string
  role: string
  period: string
  bullets: string[]
}

interface WorkingExperienceProps {
  items: WorkingExperienceItem[]
}

export function WorkingExperience({ items }: WorkingExperienceProps) {
  return (
    <>
      {items.map(({ order, company, role, period, bullets }) => (
        <div key={order}>
          <StyledCompanyName $level={2}>
            {company} - {role}
          </StyledCompanyName>
          <StyledCompanyPeriod>{period}</StyledCompanyPeriod>
          <StyledList>
            {bullets.map((bullet, i) => (
              <StyledListItem key={`${i}-${bullet}`}>
                {parseRichText(bullet, {
                  bold: (k, t) => (
                    <StyledTechnology key={k}>{t}</StyledTechnology>
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
