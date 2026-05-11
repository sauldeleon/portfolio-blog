'use client'

import React from 'react'

import {
  BackendIcon,
  DatabaseIcon,
  FileIcon,
  FrontendIcon,
  MobileIcon,
} from '@sdlgr/assets'

import { parseRichText } from '@web/utils/parseRichText/parseRichText'

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

type SkillArea = {
  icon: string
  title: string
  skills: string[]
}

interface ProfileInfoProps {
  summary: string
  skillAreasTitle: string
  areas: SkillArea[]
}

export function ProfileInfo({
  summary,
  skillAreasTitle,
  areas,
}: ProfileInfoProps) {
  return (
    <>
      <StyledSummary $level="XL">{summary}</StyledSummary>
      <StyledLabel>{skillAreasTitle}</StyledLabel>
      {areas.map(({ icon, title, skills }) => (
        <StyledSkillGroup key={icon}>
          <StyledSkillTitle>
            {iconMap[icon]}
            {title}
          </StyledSkillTitle>
          <StyledList>
            {skills.map((skill, i) => (
              <StyledListItem key={`${i}-${skill}`}>
                {parseRichText(skill, {
                  bold: (k, t) => (
                    <StyledTechnology key={k}>{t}</StyledTechnology>
                  ),
                  italic: (k, t) => <StyledItalic key={k}>{t}</StyledItalic>,
                })}
              </StyledListItem>
            ))}
          </StyledList>
        </StyledSkillGroup>
      ))}
    </>
  )
}
