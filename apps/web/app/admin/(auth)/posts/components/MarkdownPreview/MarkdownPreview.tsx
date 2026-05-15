'use client'

import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { MDXRemote } from 'next-mdx-remote'
import Image from 'next/image'
import type { ComponentPropsWithoutRef } from 'react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { serializePreview } from '../../actions/serializePreview'
import {
  StyledCaption,
  StyledCodeWrapper,
  StyledCopyButton,
  StyledEmbedWrapper,
  StyledImageWrapper,
  StyledLoading,
  StyledModalCaption,
  StyledModalClose,
  StyledModalContent,
  StyledModalDownload,
  StyledModalOverlay,
  StyledPreviewWrapper,
} from './MarkdownPreview.styles'

export interface MarkdownPreviewProps {
  content: string
  loadingLabel: string
}

export function CopyCodeBlock({
  children,
  ...props
}: ComponentPropsWithoutRef<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    /* istanbul ignore else */
    if (preRef.current) {
      void navigator.clipboard
        .writeText(preRef.current.textContent || '')
        .then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
    }
  }

  return (
    <StyledCodeWrapper>
      <StyledCopyButton onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </StyledCopyButton>
      <pre ref={preRef} {...props}>
        {children}
      </pre>
    </StyledCodeWrapper>
  )
}

export function CustomImage({ src, alt }: { src?: string; alt?: string }) {
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
        data-testid="image-wrapper"
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
          style={{ width: '100%', height: 'auto' }}
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
            data-testid="image-modal"
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

export function Embed({ type, url }: { type?: string; url?: string }) {
  if (!url) return null
  return (
    <StyledEmbedWrapper data-testid="embed-wrapper">
      <iframe src={url} allowFullScreen title={type ?? 'embed'} />
    </StyledEmbedWrapper>
  )
}

const MDX_COMPONENTS = { pre: CopyCodeBlock, img: CustomImage, Embed }

export function MarkdownPreview({
  content,
  loadingLabel,
}: MarkdownPreviewProps) {
  const [serialized, setSerialized] = useState<MDXRemoteSerializeResult | null>(
    null,
  )
  const [loading, setLoading] = useState(() => content.trim() !== '')
  const [prevContent, setPrevContent] = useState(content)

  if (content !== prevContent) {
    setPrevContent(content)
    setSerialized(null)
    setLoading(content.trim() !== '')
  }

  useEffect(() => {
    const trimmed = content.trim()
    if (!trimmed) return

    const timer = setTimeout(() => {
      void serializePreview(trimmed)
        .then((result) => {
          setSerialized(result)
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [content])

  if (!content.trim()) return null

  if (loading) {
    return (
      <StyledLoading data-testid="preview-loading">
        {loadingLabel}
      </StyledLoading>
    )
  }

  if (!serialized) return null

  return (
    <StyledPreviewWrapper data-testid="markdown-preview">
      <MDXRemote {...serialized} components={MDX_COMPONENTS} />
    </StyledPreviewWrapper>
  )
}
