import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

import { type MdxComponentLabels, createMdxComponents } from './components'
import { rehypeHeadingIds } from './rehypeHeadingIds'
import { rehypeUnwrapImages } from './rehypeUnwrapImages'
import { remarkEmbeds } from './remarkEmbeds'

export function renderMDX(source: string, labels?: MdxComponentLabels) {
  const components = labels
    ? createMdxComponents(labels)
    : createMdxComponents({ copyLabel: 'Copy', copiedLabel: 'Copied!' })

  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm, remarkEmbeds],
          rehypePlugins: [
            rehypeUnwrapImages,
            rehypeHeadingIds,
            [
              rehypePrettyCode,
              {
                theme: 'github-dark',
                keepBackground: false,
              },
            ],
          ],
        },
      }}
    />
  )
}
