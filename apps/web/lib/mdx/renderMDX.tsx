import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypePrettyCode from 'rehype-pretty-code'

import { type MdxComponentLabels, createMdxComponents } from './components'
import { rehypeHeadingIds } from './rehypeHeadingIds'

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
          rehypePlugins: [
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
