'use client'

import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { MDXRemote } from 'next-mdx-remote'
import type { ComponentPropsWithoutRef } from 'react'
import { useEffect, useState } from 'react'

import { CodeBlock } from '@sdlgr/code-block'

import { MdxTable } from '@web/components/PostContent/MdxTable'
import { PostContentCroquis } from '@web/components/PostContent/PostContentCroquis'
import { PostContentEmbed } from '@web/components/PostContent/PostContentEmbed'
import { PostContentImage } from '@web/components/PostContent/PostContentImage'
import { PostContentSlideshow } from '@web/components/PostContent/PostContentSlideshow'

import { serializePreview } from '../../actions/serializePreview'
import { StyledLoading, StyledPreviewWrapper } from './MarkdownPreview.styles'

export interface MarkdownPreviewProps {
  content: string
  loadingLabel: string
}

function PreCodeBlock(props: ComponentPropsWithoutRef<'pre'>) {
  return (
    <CodeBlock
      {...(props as ComponentPropsWithoutRef<'pre'> & {
        'data-language'?: string
      })}
    />
  )
}

function H1AsH2({
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 {...props}>{children}</h2>
}

function TableComponent(props: React.HTMLAttributes<HTMLTableElement>) {
  return <MdxTable {...props} />
}

const MDX_COMPONENTS = {
  pre: PreCodeBlock,
  img: PostContentImage,
  Embed: PostContentEmbed,
  Slideshow: PostContentSlideshow,
  Croquis: PostContentCroquis,
  h1: H1AsH2,
  table: TableComponent,
}

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
