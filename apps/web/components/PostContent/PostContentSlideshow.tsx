'use client'

import Image from 'next/image'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import { useClientTranslation } from '@web/i18n/client'

import {
  StyledCaption,
  StyledModalClose,
  StyledModalContent,
  StyledModalDownload,
  StyledModalOverlay,
  StyledPhotoMeta,
  StyledPhotoMetaItem,
  StyledPhotoMetaLabel,
} from './PostContent.styles'
import {
  StyledSlideshow,
  StyledSlideshowArrow,
  StyledSlideshowCaptionOverlay,
  StyledSlideshowCounter,
  StyledSlideshowImageArea,
  StyledSlideshowImageWrapper,
  StyledSlideshowNav,
  StyledSlideshowSlide,
} from './PostContentSlideshow.styles'

interface Slide {
  src: string
  alt: string
}

export function PostContentSlideshow({
  slides: slidesJson,
}: {
  slides: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev' | 'none'>('none')
  const [expanded, setExpanded] = useState(false)
  const { t } = useClientTranslation('common')

  let slides: Slide[] = []
  try {
    slides = JSON.parse(slidesJson) as Slide[]
  } catch {
    return null
  }

  if (!slides.length) return null

  const current = slides[currentIndex]
  const options = current.alt?.includes('=')
    ? new URLSearchParams(current.alt)
    : null
  const caption = options?.get('caption')
  const captionPos = options?.get('caption-pos') ?? 'bottom'
  const cleanAlt = options?.get('alt') ?? (options ? '' : (current.alt ?? ''))
  const expandable = options?.get('expand') === 'true'
  const photoIso = options?.get('photo-iso')
  const photoAperture = options?.get('photo-aperture')
  const photoExposure = options?.get('photo-exposure')
  const photoFocalLength = options?.get('photo-focal-length')
  const photoPanoramicCount = options?.get('photo-panoramic-count')
  const hasPhotoMeta = !!(
    photoIso ||
    photoAperture ||
    photoExposure ||
    photoFocalLength ||
    photoPanoramicCount
  )

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < slides.length - 1

  function goPrev() {
    setDirection('prev')
    setCurrentIndex((i) => i - 1)
  }

  function goNext() {
    setDirection('next')
    setCurrentIndex((i) => i + 1)
  }

  return (
    <>
      <StyledSlideshow data-testid="post-slideshow">
        <StyledSlideshowImageArea>
          <StyledSlideshowImageWrapper
            $expandable={expandable}
            onClick={expandable ? () => setExpanded(true) : undefined}
            data-testid="slideshow-image-wrapper"
          >
            <StyledSlideshowSlide key={currentIndex} $direction={direction}>
              <Image
                src={current.src}
                alt={cleanAlt}
                fill
                sizes="(max-width: 1440px) 100vw, 1440px"
                style={{ objectFit: 'contain' }}
              />
            </StyledSlideshowSlide>
          </StyledSlideshowImageWrapper>
          {caption && (
            <StyledSlideshowCaptionOverlay
              $pos={captionPos === 'top' ? 'top' : 'bottom'}
              data-testid="slideshow-caption"
            >
              {caption}
            </StyledSlideshowCaptionOverlay>
          )}
          <StyledSlideshowArrow
            $side="prev"
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            aria-label="Previous slide"
            data-testid="slideshow-prev"
          >
            <svg
              width="10"
              height="16"
              viewBox="0 0 10 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M8 2L2 8L8 14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </StyledSlideshowArrow>
          <StyledSlideshowArrow
            $side="next"
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="Next slide"
            data-testid="slideshow-next"
          >
            <svg
              width="10"
              height="16"
              viewBox="0 0 10 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 2L8 8L2 14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </StyledSlideshowArrow>
        </StyledSlideshowImageArea>
        {hasPhotoMeta && (
          <StyledPhotoMeta data-testid="slideshow-photo-meta">
            {photoIso && (
              <StyledPhotoMetaItem>
                <StyledPhotoMetaLabel>
                  {t('photoMeta.iso')}
                </StyledPhotoMetaLabel>
                <span>{photoIso}</span>
              </StyledPhotoMetaItem>
            )}
            {photoAperture && (
              <StyledPhotoMetaItem>
                <StyledPhotoMetaLabel>
                  {t('photoMeta.aperture')}
                </StyledPhotoMetaLabel>
                <span>{photoAperture}</span>
              </StyledPhotoMetaItem>
            )}
            {photoExposure && (
              <StyledPhotoMetaItem>
                <StyledPhotoMetaLabel>
                  {t('photoMeta.exposure')}
                </StyledPhotoMetaLabel>
                <span>{photoExposure}</span>
              </StyledPhotoMetaItem>
            )}
            {photoFocalLength && (
              <StyledPhotoMetaItem>
                <StyledPhotoMetaLabel>
                  {t('photoMeta.focalLength')}
                </StyledPhotoMetaLabel>
                <span>{photoFocalLength}</span>
              </StyledPhotoMetaItem>
            )}
            {photoPanoramicCount && (
              <StyledPhotoMetaItem>
                <StyledPhotoMetaLabel>
                  {t('photoMeta.panoramicCount')}
                </StyledPhotoMetaLabel>
                <span>{photoPanoramicCount}</span>
              </StyledPhotoMetaItem>
            )}
          </StyledPhotoMeta>
        )}
        <StyledSlideshowNav>
          <StyledSlideshowCounter data-testid="slideshow-counter">
            {currentIndex + 1} / {slides.length}
          </StyledSlideshowCounter>
        </StyledSlideshowNav>
      </StyledSlideshow>
      {expandable &&
        expanded &&
        createPortal(
          <StyledModalOverlay
            onClick={() => setExpanded(false)}
            data-testid="slideshow-image-modal"
          >
            <StyledModalContent onClick={(e) => e.stopPropagation()}>
              <StyledModalClose
                onClick={() => setExpanded(false)}
                aria-label="Close"
              >
                ×
              </StyledModalClose>
              <Image
                src={current.src}
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
              {caption && <StyledCaption>{caption}</StyledCaption>}
              <StyledModalDownload
                href={current.src}
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
