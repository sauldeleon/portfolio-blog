'use client'

import { useRef, useState } from 'react'

import {
  StyledCodeBlock,
  StyledCopyButton,
  StyledHeader,
  StyledLang,
} from './CodeBlock.styles'

export interface CodeBlockProps {
  children?: React.ReactNode
  'data-language'?: string
  copyLabel: string
  copiedLabel: string
}

export function CodeBlock({
  children,
  'data-language': language,
  copyLabel,
  copiedLabel,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopy = () => {
    /* istanbul ignore next */
    const text = preRef.current?.textContent ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <StyledCodeBlock>
      <StyledHeader>
        {language && <StyledLang>{language}</StyledLang>}
        <StyledCopyButton
          onClick={handleCopy}
          aria-label={copied ? copiedLabel : copyLabel}
        >
          {copied ? copiedLabel : copyLabel}
        </StyledCopyButton>
      </StyledHeader>
      <pre ref={preRef}>{children}</pre>
    </StyledCodeBlock>
  )
}
