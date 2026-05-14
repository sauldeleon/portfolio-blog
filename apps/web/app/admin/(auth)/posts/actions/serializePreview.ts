'use server'

import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'

import { remarkEmbeds } from './remarkEmbeds'

export async function serializePreview(
  content: string,
): Promise<MDXRemoteSerializeResult> {
  return serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkEmbeds],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            theme: 'github-dark',
            keepBackground: false,
          },
        ],
      ],
    },
  })
}
