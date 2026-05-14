'use server'

import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'

export async function serializePreview(
  content: string,
): Promise<MDXRemoteSerializeResult> {
  return serialize(content)
}
