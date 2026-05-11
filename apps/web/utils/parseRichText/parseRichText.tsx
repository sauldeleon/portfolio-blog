import React from 'react'

type RichTextTag = 'bold' | 'italic' | 'linkComponent'

type RichTextComponents = Partial<
  Record<RichTextTag, (key: number, text: string) => React.ReactNode>
>

export function parseRichText(
  text: string,
  components: RichTextComponents,
): React.ReactNode[] {
  const pattern =
    /(<bold>[\s\S]*?<\/bold>|<italic>[\s\S]*?<\/italic>|<linkComponent>[\s\S]*?<\/linkComponent>)/g
  const parts = text.split(pattern)

  return parts.map((part, i) => {
    const boldMatch = part.match(/^<bold>([\s\S]*?)<\/bold>$/)
    if (boldMatch && components.bold) return components.bold(i, boldMatch[1])

    const italicMatch = part.match(/^<italic>([\s\S]*?)<\/italic>$/)
    if (italicMatch && components.italic)
      return components.italic(i, italicMatch[1])

    const linkMatch = part.match(/^<linkComponent>([\s\S]*?)<\/linkComponent>$/)
    if (linkMatch && components.linkComponent)
      return components.linkComponent(i, linkMatch[1])

    return part
  })
}
