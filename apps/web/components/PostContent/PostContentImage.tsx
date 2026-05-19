'use client'

import Image from 'next/image'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import {
  StyledCaption,
  StyledImageWrapper,
  StyledModalCaption,
  StyledModalClose,
  StyledModalContent,
  StyledModalDownload,
  StyledModalOverlay,
} from './PostContent.styles'

export function PostContentImage({ src, alt }: { src?: string; alt?: string }) {
  const [expanded, setExpanded] = useState(false)

  if (!src) return null

  const options = alt?.includes('=') ? new URLSearchParams(alt) : null
  const size = options?.get('size')
  const align = options?.get('align')
  const caption = options?.get('caption')
  const captionPos = options?.get('caption-pos') ?? 'bottom'
  const cleanAlt = options?.get('alt') ?? (options ? '' : (alt ?? ''))
  const expandable = options?.get('expand') === 'true'

  const sizes =
    size === 'small'
      ? '256px'
      : size === 'medium'
        ? '448px'
        : '(max-width: 1440px) 100vw, 1440px'

  return (
    <>
      <StyledImageWrapper
        $align={align}
        $size={size}
        $expandable={expandable}
        onClick={expandable ? () => setExpanded(true) : undefined}
        data-testid="post-image-wrapper"
      >
        {caption && captionPos === 'top' && (
          <StyledCaption>{caption}</StyledCaption>
        )}
        <Image
          src={src}
          alt={cleanAlt}
          width={0}
          height={0}
          sizes={sizes}
          style={{ width: '100%', height: 'auto', maxWidth: '1440px' }}
        />
        {caption && captionPos !== 'top' && (
          <StyledCaption>{caption}</StyledCaption>
        )}
      </StyledImageWrapper>
      {expandable &&
        expanded &&
        createPortal(
          <StyledModalOverlay
            onClick={() => setExpanded(false)}
            data-testid="post-image-modal"
          >
            <StyledModalContent onClick={(e) => e.stopPropagation()}>
              <StyledModalClose
                onClick={() => setExpanded(false)}
                aria-label="Close"
              >
                ×
              </StyledModalClose>
              <Image
                src={src}
                alt={cleanAlt}
                width={0}
                height={0}
                sizes="90vw"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  width: 'auto',
                  height: 'auto',
                }}
              />
              {caption && <StyledModalCaption>{caption}</StyledModalCaption>}
              <StyledModalDownload
                href={src}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original
              </StyledModalDownload>
            </StyledModalContent>
          </StyledModalOverlay>,
          document.body,
        )}
    </>
  )
}
