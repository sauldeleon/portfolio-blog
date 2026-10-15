'use client'

import { Fragment } from 'react'

import {
  StyledFormatBar,
  StyledFormatButton,
  StyledFormatSeparator,
} from './MarkdownToolbar.styles'
import type { FormatAction } from './markdownFormat'

interface ToolbarButton {
  action: FormatAction | 'link'
  label: React.ReactNode
  title: string
}

/** Buttons in groups, separated in the bar. */
const GROUPS: ToolbarButton[][] = [
  [
    { action: 'bold', label: <strong>B</strong>, title: 'Bold (Ctrl/Cmd+B)' },
    { action: 'italic', label: <em>I</em>, title: 'Italic (Ctrl/Cmd+I)' },
    { action: 'strike', label: <s>S</s>, title: 'Strikethrough' },
  ],
  [
    { action: 'h2', label: 'H2', title: 'Heading' },
    { action: 'h3', label: 'H3', title: 'Subheading' },
  ],
  [
    { action: 'ul', label: '•', title: 'Bulleted list' },
    { action: 'ol', label: '1.', title: 'Numbered list' },
    { action: 'quote', label: '❝', title: 'Quote' },
  ],
  [
    { action: 'code', label: '</>', title: 'Inline code' },
    { action: 'codeBlock', label: '{ }', title: 'Code block' },
    { action: 'hr', label: '—', title: 'Horizontal rule' },
    { action: 'link', label: '🔗', title: 'Link (Ctrl/Cmd+K)' },
  ],
]

export interface MarkdownToolbarProps {
  onFormat: (action: FormatAction) => void
  onLink: () => void
}

export function MarkdownToolbar({ onFormat, onLink }: MarkdownToolbarProps) {
  return (
    <StyledFormatBar role="toolbar" aria-label="Formatting">
      {GROUPS.map((group, gi) => (
        <Fragment key={gi}>
          {gi > 0 && <StyledFormatSeparator aria-hidden="true" />}
          {group.map(({ action, label, title }) => (
            <StyledFormatButton
              key={action}
              title={title}
              aria-label={title}
              // Keep the textarea selection while clicking.
              onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
              onClick={() => (action === 'link' ? onLink() : onFormat(action))}
              data-testid={`format-${action}`}
            >
              {label}
            </StyledFormatButton>
          ))}
        </Fragment>
      ))}
    </StyledFormatBar>
  )
}

/** Shortcut for a key pressed with Ctrl/Cmd in the content textarea. */
export function shortcutFor(
  e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>,
): FormatAction | 'link' | null {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return null
  const key = e.key.toLowerCase()
  if (key === 'b') return 'bold'
  if (key === 'i') return 'italic'
  if (key === 'k') return 'link'
  return null
}

export const MARKDOWN_GUIDE = `**bold**   _italic_   ~~struck~~   \`code\`

## Heading            (# also becomes a heading: the post title is the H1)
### Subheading

- item               1. first
- item               2. second

> Quote

[text](https://...)  external links open in a new tab, /es/blog/... stays

\`\`\`js
code block (any language for highlighting)
\`\`\`

---                  horizontal rule (leave a blank line above it)

| Col | Col |        tables
| --- | --- |
| a   | b   |

<Callout type="note">Text</Callout>      type: note | warning | tip

![size=small&align=right&caption=Text&alt=Text&expand=true](url)
  size small|medium · align left|right · caption-pos=top · all optional

Images, embeds, GPX maps, slideshows, croquis and cards: use the buttons above.`
