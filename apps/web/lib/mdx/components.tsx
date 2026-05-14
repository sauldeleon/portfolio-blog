import { BlogImage } from '@sdlgr/blog-image'
import { Callout } from '@sdlgr/callout'
import { CodeBlock } from '@sdlgr/code-block'

export interface MdxComponentLabels {
  copyLabel: string
  copiedLabel: string
}

export function createMdxComponents(labels: MdxComponentLabels) {
  return {
    Callout,
    BlogImage,
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
