'use client'

import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { MDXRemote } from 'next-mdx-remote'
import type { ComponentPropsWithoutRef } from 'react'
import { useEffect, useMemo, useState } from 'react'

import { CodeBlock } from '@sdlgr/code-block'

import { MdxErrorBoundary } from '@web/components/MdxErrorBoundary'
import { MdxTable } from '@web/components/PostContent/MdxTable'
import { PostContentCanyonSummary } from '@web/components/PostContent/PostContentCanyonSummary'
import { PostContentCroquis } from '@web/components/PostContent/PostContentCroquis'
import { PostContentFerrataSummary } from '@web/components/PostContent/PostContentFerrataSummary'
import { PostContentRouteSummary } from '@web/components/PostContent/PostContentRouteSummary'
import type { Lang } from '@web/lib/cards'
import { POST_CONTENT_EMBEDS } from '@web/lib/mdx/components'

import { serializePreview } from '../../actions/serializePreview'
import { StyledLoading, StyledPreviewWrapper } from './MarkdownPreview.styles'

export interface MarkdownPreviewProps {
  content: string
  loadingLabel: string
  /** Content locale being previewed — the admin UI language may differ. */
  lang: Lang
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
  ...POST_CONTENT_EMBEDS,
  h1: H1AsH2,
  table: TableComponent,
}

export function MarkdownPreview({
  content,
  loadingLabel,
  lang,
}: MarkdownPreviewProps) {
  // The croquis / canyon summary localise to the previewed content locale, not
  // the admin UI.
  const components = useMemo(
    () => ({
      ...MDX_COMPONENTS,
      Croquis: (props: {
        obstacles?: string
        title?: string
        noDownload?: boolean
        noReport?: boolean
        summary?: string
      }) => <PostContentCroquis {...props} lang={lang} />,
      CanyonSummary: (props: { data?: string; noDownload?: boolean }) => (
        <PostContentCanyonSummary {...props} lang={lang} />
      ),
      FerrataSummary: (props: { data?: string; noDownload?: boolean }) => (
        <PostContentFerrataSummary {...props} lang={lang} />
      ),

      RouteSummary: (props: { data?: string; noDownload?: boolean }) => (
        <PostContentRouteSummary {...props} lang={lang} />
      ),
    }),
    [lang],
  )
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
      <MdxErrorBoundary>
        <MDXRemote {...serialized} components={components} />
      </MdxErrorBoundary>
    </StyledPreviewWrapper>
  )
}
