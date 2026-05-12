import { MDXRemote } from 'next-mdx-remote/rsc'

import { mdxComponents } from './components'

export function renderMDX(source: string) {
  return <MDXRemote source={source} components={mdxComponents} />
}
