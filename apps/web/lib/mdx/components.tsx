import { Callout } from '@sdlgr/callout'
import { CodeBlock } from '@sdlgr/code-block'

import { MdxTable } from '@web/components/PostContent/MdxTable'
import { PostContentEmbed } from '@web/components/PostContent/PostContentEmbed'
import { PostContentImage } from '@web/components/PostContent/PostContentImage'
import { PostContentSlideshow } from '@web/components/PostContent/PostContentSlideshow'

export interface MdxComponentLabels {
  copyLabel: string
  copiedLabel: string
}

export function createMdxComponents(labels: MdxComponentLabels) {
  return {
    Callout,
    Embed: PostContentEmbed,
    Slideshow: PostContentSlideshow,
    img: PostContentImage,
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h2 {...props}>{children}</h2>
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
      <MdxTable {...props} />
    ),
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <CodeBlock
        {...(props as React.HTMLAttributes<HTMLPreElement> & {
          'data-language'?: string
        })}
        copyLabel={labels.copyLabel}
        copiedLabel={labels.copiedLabel}
      />
    ),
  }
}

export const mdxComponents = createMdxComponents({
  copyLabel: 'Copy',
  copiedLabel: 'Copied!',
})
