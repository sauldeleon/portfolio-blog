import { format } from 'date-fns/format'

import { getExperienceItems } from '@web/components/ExperiencePage/experienceItems'
import { getServerTranslation } from '@web/i18n/server'

import { PortfolioPageClient } from './PortfolioPageClient'
import type {
  CvExperienceEntry,
  CvOtherEntry,
  CvSkillArea,
} from './components/CvDocument/CvDocument'
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

function parseCvRichText(html: string): TextSegment[] {
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

interface PortfolioPageProps {
  lng: string
}

export async function PortfolioPage({ lng }: PortfolioPageProps) {
  const { t } = await getServerTranslation({
    ns: 'portfolioPage',
    language: lng,
  })
  const { t: tExp } = await getServerTranslation({
    ns: 'experiencePage',
    language: lng,
  })

  const areasRaw = t('items.profile.skillAreas.areas', { returnObjects: true })
  const areas: { icon: string; title: string; skills: string[] }[] =
    Array.isArray(areasRaw) ? areasRaw : []

  const otherItemsRaw = t('items.other.otherAreas', { returnObjects: true })
  const otherItems: {
    name: string
    beginYear?: string
    endYear?: string
    highlights: string[]
  }[] = Array.isArray(otherItemsRaw) ? otherItemsRaw : []

  const experienceItems = getExperienceItems()
  const sortedExperience = [...experienceItems].sort(
    (a, b) => a.order - b.order,
  )

  const workingExperienceItems = sortedExperience.map(
    ({ order, company, beginDate, endDate, descriptionParagraphKeys }) => ({
      order,
      company,
      role: tExp(descriptionParagraphKeys[0]),
      period: `${format(beginDate, 'MMMM yyyy')}${endDate ? format(endDate, ' - MMMM yyyy') : ''}`,
      bullets: descriptionParagraphKeys.slice(1).map((key) => tExp(key)),
    }),
  )

  const otherStuffItems = otherItems.map(
    ({ name, beginYear, endYear, highlights }) => ({
      name,
      period: `${beginYear ?? ''}${endYear ? ' - ' + endYear : ''}`,
      highlights,
    }),
  )

  const skillAreas: CvSkillArea[] = areas.map(({ title, skills }) => ({
    title,
    skills: skills.map((skill) => parseCvRichText(skill)),
  }))

  const experienceEntries: CvExperienceEntry[] = sortedExperience.map(
    ({ company, beginDate, endDate, descriptionParagraphKeys }) => ({
      company,
      role: tExp(descriptionParagraphKeys[0]),
      period: `${format(beginDate, 'MMMM yyyy')} - ${endDate ? format(endDate, 'MMMM yyyy') : tExp('present')}`,
      bullets: descriptionParagraphKeys
        .slice(1)
        .map((key) => parseCvRichText(tExp(key))),
    }),
  )

  const otherEntries: CvOtherEntry[] = otherItems.map(
    ({ name, beginYear, endYear, highlights }) => ({
      name: parseCvRichText(name),
      period: `${beginYear ?? ''}${endYear ? ' - ' + endYear : ''}`,
      highlights: highlights.map((h) => parseCvRichText(h)),
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
    <PortfolioPageClient
      lng={lng}
      cvData={cvData}
      downloadLabel={t('downloadCv')}
      generatingLabel={t('generatingCv')}
      shareLabel={t('shareWithAFriend')}
      sharedLabel={t('shared')}
    >
      <PortfolioHeading
        softwareEngineer={t('items.softwareEngineer')}
        basedIn={t('basedIn')}
        profilePicture={t('profilePicture')}
      />
      <PortfolioItem title={t('items.profile.title')}>
        <ProfileInfo
          summary={t('items.profile.summary')}
          skillAreasTitle={t('items.profile.skillAreas.title')}
          areas={areas}
        />
      </PortfolioItem>
      <PortfolioItem title={t('items.workingExperience')}>
        <WorkingExperience items={workingExperienceItems} />
      </PortfolioItem>
      <PortfolioItem title={t('items.other.title')}>
        <OtherStuff items={otherStuffItems} />
      </PortfolioItem>
    </PortfolioPageClient>
  )
}
