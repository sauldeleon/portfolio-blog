import Image from 'next/image'
import Link from 'next/link'

import {
  StyledResultImageWrapper,
  StyledResultLink,
  StyledResultPage,
  StyledResultText,
  StyledResultTitle,
} from './SubscribeResultPage.styles'

export interface SubscribeResultPageProps {
  success: boolean
  successTitle: string
  successMessage: string
  errorTitle: string
  backToLabel: string
  backToHref: string
  imageSrc?: string
  imageAlt?: string
}

export function SubscribeResultPage({
  success,
  successTitle,
  successMessage,
  errorTitle,
  backToLabel,
  backToHref,
  imageSrc,
  imageAlt,
}: SubscribeResultPageProps) {
  return (
    <StyledResultPage>
      {success && imageSrc && (
        <StyledResultImageWrapper>
          <Image
            src={imageSrc}
            alt={imageAlt ?? ''}
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
        </StyledResultImageWrapper>
      )}
      <StyledResultTitle>
        {success ? successTitle : errorTitle}
      </StyledResultTitle>
      {success && <StyledResultText>{successMessage}</StyledResultText>}
      <StyledResultLink as={Link} href={backToHref}>
        {backToLabel}
      </StyledResultLink>
    </StyledResultPage>
  )
}
