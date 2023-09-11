import {
  FigmaIcon,
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

export function AboutModal({ isOpen, setIsOpen }: AboutModalProps) {
  const { t } = useClientTranslation('footer')
  const usedTechs: {
    key: string
    href: string
    ariaLabel: string
    icon: React.ReactNode
  }[] = [
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

  return (
    <StyledModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <section>
        <StyledModalHeading $level={2} as="h4" id="about-modal-label">
          {t('aboutModalTitle')}
        </StyledModalHeading>

        <StyledLabel $level="L">{t('sourceCode')}</StyledLabel>
        <StyledPropertyWrapper>
          <Body>{t('usedTechs')}</Body>
          <StyledList>
            {usedTechs.map(({ key, href, icon, ariaLabel }) => (
              <li key={key}>
                <StyledIconLink aria-label={ariaLabel} href={href}>
                  {icon}
                </StyledIconLink>
              </li>
            ))}
          </StyledList>
        </StyledPropertyWrapper>
        <StyledPropertyWrapper>
          <Body>{t('repository')}</Body>
          <StyledIconLink href="https://github.com/sauldeleon/portfolio-blog">
            <GithubIcon width={20} height={20} />
          </StyledIconLink>
        </StyledPropertyWrapper>

        <StyledLabel $level="L">{t('design')}</StyledLabel>
        <StyledPropertyWrapper>
          <Body>
            {t('designedBy', {
              name: 'Valentina Florentina Balta-Cojocaru-Stan',
            })}
          </Body>
          <StyledIconLink
            href="https://www.linkedin.com/in/valentina-florentina-balta-cojocaru-stan-83619014a/"
            aria-label={t('checkDesignerHereAria', {
              name: 'Valentina Florentina Balta-Cojocaru-Stan',
            })}
          >
            <LinkedInIcon width={20} height={20} />
          </StyledIconLink>
        </StyledPropertyWrapper>
        <StyledPropertyWrapper>
          <Body>{t('designLink')}</Body>
          <StyledIconLink
            href="https://www.figma.com/file/ZgfaiU473XMQAWz9kbiMO6/Saul-portfolio-%2B-design-library"
            aria-label={t('checkDesignHereAria')}
          >
            <FigmaIcon width={20} height={20} />
          </StyledIconLink>
        </StyledPropertyWrapper>
      </section>
    </StyledModal>
  )
}
