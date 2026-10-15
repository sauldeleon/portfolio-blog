import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  DEFAULT_TRANSLATION_MODEL,
  TRANSLATION_SYSTEM_PROMPT,
  buildTranslationRequest,
} from '@web/lib/ai/translatePost'
import {
  type TranslationStatus,
  classifyAnthropicError,
  unavailable,
} from '@web/lib/ai/translationStatus'
import { parseAuthRequest, requireAuth } from '@web/lib/api/parseRequest'
import { logger } from '@web/lib/logger'

const locale = z.enum(['en', 'es'])

const translateSchema = z
  .object({
    from: locale,
    to: locale,
    title: z.string().max(500),
    excerpt: z.string().max(5_000),
    content: z.string().max(200_000),
  })
  .refine((body) => body.from !== body.to, 'Languages must differ')
  .refine(
    (body) => [body.title, body.excerpt, body.content].some((f) => f.trim()),
    'Nothing to translate',
  )

function model(): string {
  return process.env.ANTHROPIC_MODEL || DEFAULT_TRANSLATION_MODEL
}

function createClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  const workspaceId = process.env.ANTHROPIC_WORKSPACE_ID
  return new Anthropic({
    apiKey,
    // Keys not scoped to a workspace must name one on every request.
    defaultHeaders: workspaceId
      ? { 'anthropic-workspace-id': workspaceId }
      : undefined,
  })
}

/**
 * Whether translating can work: key, workspace, model and reachability. It
 * costs no tokens, so it cannot tell whether there is credit left.
 */
export async function GET() {
  const authResult = await requireAuth()
  if (!authResult.ok) return authResult.response

  const client = createClient()
  let status: TranslationStatus = { available: true }
  if (!client) {
    status = unavailable('not_configured')
  } else {
    try {
      await client.models.retrieve(model())
    } catch (err) {
      const failure = classifyAnthropicError(err)
      logger.warn({ reason: failure.reason }, 'GET /api/translate: unavailable')
      status = failure
    }
  }
  return NextResponse.json(status, { headers: { 'Cache-Control': 'no-store' } })
}

/**
 * Translates a post with Claude, streaming the raw reply as plain text
 * (`<title>`, `<excerpt>` and `<content>` sections, see `parseTranslation`).
 * Errors come back as JSON with the reason, see `TranslationStatus`.
 */
export async function POST(request: Request) {
  const result = await parseAuthRequest(request, translateSchema)
  if (!result.ok) return result.response

  const client = createClient()
  if (!client) {
    return NextResponse.json(unavailable('not_configured'), { status: 503 })
  }

  const { from, to, ...fields } = result.data
  let stream: AsyncIterable<Anthropic.MessageStreamEvent>
  try {
    stream = await client.messages.create(
      {
        model: model(),
        max_tokens: 32_000,
        stream: true,
        system: [
          {
            type: 'text',
            text: TRANSLATION_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: buildTranslationRequest(from, to, fields),
          },
        ],
      },
      { signal: request.signal },
    )
  } catch (err) {
    const status = classifyAnthropicError(err)
    logger.error(err, 'POST /api/translate: request failed')
    return NextResponse.json(status, { status: 502 })
  }

  const encoder = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      } catch (err) {
        logger.error(err, 'POST /api/translate: stream failed')
        controller.error(err)
      }
    },
  })
  logger.info({ from, to }, 'POST /api/translate: streaming')
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
