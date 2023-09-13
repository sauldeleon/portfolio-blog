import {
  FigmaIcon,
  GetTheIdeaIcon,
  GithubIcon,
  JestIcon,
  LinkedInIcon,
  NextJSIcon,
  NxIcon,
  StyledComponentsIcon,
  YarnIcon,
} from '@sdlgr/assets'
import { Body } from '@sdlgr/typography'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledIconLink,
  StyledLabel,
  StyledList,
  StyledModal,
  StyledModalHeading,
  StyledPropertyWrapper,
} from './AboutModal.styles'

interface AboutModalProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

type IconListItemProps = {
  key: string
  href: string
  ariaLabel: string
  icon: React.ReactNode
}

export function AboutModal({ isOpen, setIsOpen }: AboutModalProps) {
  const { t } = useClientTranslation('footer')
  const developmentIcons: IconListItemProps[] = [
    {
      key: 'nextjs',
      href: 'https://nextjs.org/',
      ariaLabel: 'NextJS',
      icon: <NextJSIcon width={20} height={20} />,
    },
    {
      key: 'styled-components',
      href: 'https://styled-components.com/',
      ariaLabel: 'Styled-components',
      icon: <StyledComponentsIcon width={20} height={20} />,
    },
    {
      key: 'jest',
      href: 'https://jestjs.io/',
      ariaLabel: 'Jest',
      icon: <JestIcon width={20} height={20} />,
    },
    {
      key: 'nx',
      href: 'https://nx.dev/',
      ariaLabel: 'NX',
      icon: <NxIcon width={20} height={20} />,
    },
    {
      key: 'yarn',
      href: 'https://yarnpkg.com/',
      ariaLabel: 'Yarn',
      icon: <YarnIcon width={20} height={20} />,
    },
  ]

  const repositoryIcons: IconListItemProps[] = [
    {
      key: 'github',
      href: 'https://github.com/sauldeleon/portfolio-blog',
      ariaLabel: t('checkRepoHereAria'),
      icon: <GithubIcon width={20} />,
    },
  ]

  const designerIcons: IconListItemProps[] = [
    {
      key: 'linkedIn',
      href: 'https://www.linkedin.com/in/valentina-florentina-balta-cojocaru-stan-83619014a/',
      ariaLabel: t('checkLinkedInProfileAria', {
        name: 'Valentina Florentina Balta-Cojocaru-Stan',
      }),
      icon: <LinkedInIcon width={20} height={20} />,
    },
    {
      key: 'getTheIdea',
      href: 'http://valentina.pro/index.html',
      ariaLabel: t('getTheIdeaAria', {
        name: 'Valentina Florentina Balta-Cojocaru-Stan',
      }),
      icon: <GetTheIdeaIcon width={20} />,
    },
  ]

  const designIcons: IconListItemProps[] = [
    {
      key: 'figma',
      href: 'https://www.figma.com/file/ZgfaiU473XMQAWz9kbiMO6/Saul-portfolio-%2B-design-library',
      ariaLabel: t('checkDesignHereAria'),
      icon: <FigmaIcon width={20} height={20} />,
    },
  ]

  const modalSections = [
    {
      label: t('development'),
      key: 'development',
      properties: [
        { label: t('usedTechs'), key: 'usedTechs', icons: developmentIcons },
        { label: t('repository'), key: 'repository', icons: repositoryIcons },
      ],
    },
    {
      label: t('design'),
      key: 'design',
      properties: [
        { label: t('designer'), key: 'designer', icons: designerIcons },
        { label: t('designLink'), key: 'designLink', icons: designIcons },
      ],
    },
  ]

  return (
    <StyledModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <section>
        <StyledModalHeading $level={2} as="h4" id="about-modal-label">
          {t('aboutModalTitle')}
        </StyledModalHeading>

        {modalSections.map(({ label, key, properties }) => (
          <div key={key}>
            <StyledLabel $level="L">{label}</StyledLabel>
            {properties.map(({ label, key, icons }) => (
              <StyledPropertyWrapper key={key}>
                <Body>{label}</Body>
                <StyledList>
                  {icons.map(({ key, href, icon, ariaLabel }) => (
                    <li key={key}>
                      <StyledIconLink aria-label={ariaLabel} href={href}>
                        {icon}
                      </StyledIconLink>
                    </li>
                  ))}
                </StyledList>
              </StyledPropertyWrapper>
            ))}
          </div>
        ))}
      </section>
    </StyledModal>
  )
}
