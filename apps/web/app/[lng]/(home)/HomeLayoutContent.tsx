'use client'

import React from 'react'

import {
  ArrowRightIcon,
  CameraIcon,
  CatIcon,
  GameControllerIcon,
  HikeIcon,
} from '@sdlgr/assets'
import { Body, Label } from '@sdlgr/typography'

import {
  StyledAttribute,
  StyledAttributeContent,
  StyledAttributes,
  StyledCircleLink,
  StyledContainer,
  StyledHeading,
  StyledSubHeading,
  StyledSummary,
} from './layout.styles'

type AttributeKey = 'mountaineer' | 'petter' | 'gamer' | 'photographer'

const ATTRIBUTE_ICONS: Record<AttributeKey, React.ReactElement> = {
  mountaineer: <HikeIcon width={22} height={22} />,
  petter: <CatIcon width={22} height={22} />,
  gamer: <GameControllerIcon width={22} height={22} />,
  photographer: <CameraIcon width={22} height={22} />,
}

function parseAttributeText(
  text: string,
  icon: React.ReactElement,
): React.ReactNode {
  const [before, after = ''] = text.split('<icon/>')
  return (
    <>
      {before}
      {icon}
      {after}
    </>
  )
}

interface HomeLayoutContentProps {
  lng: string
  explore: string
  aboutMe: string
  experience: string
  summary: string[]
  attributes: Record<AttributeKey, string>
  children: React.ReactNode
}

export function HomeLayoutContent({
  lng,
  explore,
  aboutMe,
  experience,
  summary,
  attributes,
  children,
}: HomeLayoutContentProps) {
  const summaryElements: React.ReactNode[] = [
    ...summary,
    <StyledAttributes key="attributes">
      {(Object.keys(attributes) as AttributeKey[]).map((key) => (
        <StyledAttribute key={`${key}-attribute`}>
          <StyledAttributeContent>
            {parseAttributeText(attributes[key], ATTRIBUTE_ICONS[key])}
          </StyledAttributeContent>
        </StyledAttribute>
      ))}
    </StyledAttributes>,
  ]

  return (
    <StyledContainer>
      <StyledHeading $level={2}>Saúl de León Guerrero</StyledHeading>
      <StyledCircleLink
        href={`/${lng}/experience`}
        iconContent={<Label $level="XS">{explore}</Label>}
        iconSize={76}
      />
      {children}
      <StyledSubHeading as="h2" $level={2}>
        {aboutMe}
      </StyledSubHeading>
      <StyledSummary>
        {summaryElements.map((text, index) => (
          <Body key={index}>{text}</Body>
        ))}
      </StyledSummary>
      <StyledCircleLink
        href={`/${lng}/experience`}
        iconContent={<ArrowRightIcon />}
        label={experience}
      />
    </StyledContainer>
  )
}
