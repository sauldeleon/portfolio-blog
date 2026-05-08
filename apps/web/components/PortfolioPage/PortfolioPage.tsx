'use client'

import { format } from 'date-fns/format'
import { useEffect, useState } from 'react'
import { useIsScrolling } from 'react-use-is-scrolling'

import { ScrollTop, ShareIcon } from '@sdlgr/assets'

import { useExperienceItems } from '@web/components/ExperiencePage/useExperienceItems'
import { useClientTranslation } from '@web/i18n/client'

import {
  StyledActionContainer,
  StyledContent,
  StyledLabel,
  StyledScrollButton,
  StyledScrollColumn,
  StyledShareButton,
  StyledWrap,
} from './PortfolioPage.styles'
import {
  CvExperienceEntry,
  CvOtherEntry,
  CvSkillArea,
} from './components/CvDocument/CvDocument'
import { DownloadCvButton } from './components/DownloadCvButton/DownloadCvButton'
import { OtherStuff } from './components/OtherStuff/OtherStuff'
import { PortfolioHeading } from './components/PortfolioHeading/PortfolioHeading'
import { PortfolioItem } from './components/PortfolioItem/PortfolioItem'
import { ProfileInfo } from './components/ProfileInfo/ProfileInfo'
import { WorkingExperience } from './components/WorkingExperience/WorkingExperience'

type TextSegment = {
  text: string
  bold?: boolean
  italic?: boolean
  link?: string
}

const LINK_URLS: Record<string, string> = {
  linkComponent:
    'https://rd.springer.com/chapter/10.1007/978-3-642-21350-2_29#page-1',
}

function parseRichText(html: string): TextSegment[] {
  const segments: TextSegment[] = []
  const parts = html.split(/(<\/?(?:bold|italic|linkComponent)>)/g)
  let isBold = false
  let isItalic = false
  let isLink = false

  for (const part of parts) {
    switch (part) {
      case '<bold>':
        isBold = true
        break
      case '</bold>':
        isBold = false
        break
      case '<italic>':
        isItalic = true
        break
      case '</italic>':
        isItalic = false
        break
      case '<linkComponent>':
        isLink = true
        break
      case '</linkComponent>':
        isLink = false
        break
      default:
        segments.push({
          text: part,
          bold: isBold || undefined,
          italic: isItalic || undefined,
          link: isLink ? LINK_URLS.linkComponent : undefined,
        })
    }
  }

  return segments
}

export function PortfolioPage() {
  const { t, i18n } = useClientTranslation('portfolioPage')
  const lng = i18n.resolvedLanguage ?? 'en'
  const { t: tExp } = useClientTranslation('experiencePage')
  const [scroll, setScroll] = useState(0)
  const [isShared, setIsShared] = useState(false)
  const { isScrolling, scrollDirectionY } = useIsScrolling()
  const experienceItems = useExperienceItems()

  useEffect(() => {
    const listener = () => {
      const scrollValue =
        window.scrollY / (document.body.offsetHeight - window.innerHeight)
      setScroll(scrollValue)
    }
    window.addEventListener('scroll', listener)
    return () => window.removeEventListener('scroll', listener)
  }, [])

  const areasRaw = t('items.profile.skillAreas.areas', { returnObjects: true })
  const areas = Array.isArray(areasRaw) ? areasRaw : []
  const skillAreas: CvSkillArea[] = areas.map(
    ({ title, skills }: { title: string; skills: string[] }) => ({
      title,
      skills: skills.map((skill) => parseRichText(skill)),
    }),
  )

  const sortedExperience = [...experienceItems].sort(
    (a, b) => a.order - b.order,
  )
  const experienceEntries: CvExperienceEntry[] = sortedExperience.map(
    ({ company, beginDate, endDate, descriptionParagraphKeys }) => ({
      company,
      role: tExp(descriptionParagraphKeys[0]),
      period: `${format(beginDate, 'MMMM yyyy')} - ${endDate ? format(endDate, 'MMMM yyyy') : tExp('present')}`,
      bullets: descriptionParagraphKeys
        .slice(1)
        .map((key) => parseRichText(tExp(key))),
    }),
  )

  const otherItemsRaw = t('items.other.otherAreas', { returnObjects: true })
  const otherItems = Array.isArray(otherItemsRaw) ? otherItemsRaw : []
  const otherEntries: CvOtherEntry[] = otherItems.map(
    ({
      name,
      beginYear,
      endYear,
      highlights,
    }: {
      name: string
      beginYear?: string
      endYear?: string
      highlights: string[]
    }) => ({
      name: parseRichText(name),
      period: `${beginYear ?? ''}${endYear ? ' - ' + endYear : ''}`,
      highlights: highlights.map((h) => parseRichText(h)),
    }),
  )

  const cvData = {
    name: 'Saúl de León Guerrero',
    title: t('items.softwareEngineer'),
    location: t('basedIn'),
    email: 'sauldeleonguerrero@gmail.com',
    summary: t('items.profile.summary'),
    profileSectionTitle: t('items.profile.title'),
    skillsSectionTitle: t('items.profile.skillAreas.title'),
    skillAreas,
    experienceSectionTitle: t('items.workingExperience'),
    experienceEntries,
    otherSectionTitle: t('items.other.title'),
    otherEntries,
  }

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        style={{ display: 'none' }}
      >
        <defs>
          <filter id="fancy-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -14"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <StyledContent>
        <StyledScrollColumn $active={scroll > 0.1} data-testid="scrollColumn">
          <StyledScrollButton
            data-testid="scrollToTop"
            $isScrolling={isScrolling}
            $scrollingDirection={scrollDirectionY}
            onClick={() => window.scrollTo(0, 0)}
          >
            <ScrollTop height={18} />
          </StyledScrollButton>
        </StyledScrollColumn>
        <StyledWrap>
          <PortfolioHeading />
          <PortfolioItem title={t('items.profile.title')}>
            <ProfileInfo />
          </PortfolioItem>
          <PortfolioItem title={t('items.workingExperience')}>
            <WorkingExperience />
          </PortfolioItem>
          <PortfolioItem title={t('items.other.title')}>
            <OtherStuff />
          </PortfolioItem>
        </StyledWrap>
      </StyledContent>
      <StyledActionContainer>
        <DownloadCvButton
          lng={lng}
          cvData={cvData}
          photoPath="/assets/portrait-4.png"
          downloadLabel={t('downloadCv')}
          generatingLabel={t('generatingCv')}
          filename={`CV-SaulDeLeonGuerrero-${lng}.pdf`}
        />
        <StyledShareButton
          variant="contained"
          onClick={() => {
            navigator.clipboard.writeText(document.location.href)
            if (navigator.share !== undefined) {
              navigator.share({ url: document.location.href })
            }
            setIsShared(true)
          }}
        >
          <ShareIcon height={40} width={40} />
          <StyledLabel>
            {t(isShared ? 'shared' : 'shareWithAFriend')}
          </StyledLabel>
        </StyledShareButton>
      </StyledActionContainer>
    </>
  )
}
