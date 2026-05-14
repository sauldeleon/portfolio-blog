'use client'

import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { MDXRemote } from 'next-mdx-remote'
import { useEffect, useState } from 'react'

import { serializePreview } from '../../actions/serializePreview'
import { StyledLoading, StyledPreviewWrapper } from './MarkdownPreview.styles'

export interface MarkdownPreviewProps {
  content: string
  loadingLabel: string
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
      <MDXRemote {...serialized} />
    </StyledPreviewWrapper>
  )
}
