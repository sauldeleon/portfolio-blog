export type TranslationUnavailableReason =
  | 'not_configured'
  | 'invalid_key'
  | 'workspace_required'
  | 'no_credit'
  | 'model_unavailable'
  | 'rate_limited'
  | 'unavailable'
  | 'failed'

export type TranslationStatus =
  | { available: true }
  | {
      available: false
      reason: TranslationUnavailableReason
      message: string
    }

const MESSAGES: Record<TranslationUnavailableReason, string> = {
  not_configured: 'Translation is off: ANTHROPIC_API_KEY is not set.',
  invalid_key: 'The Anthropic API key is invalid or has no access.',
  workspace_required:
    'This API key is not scoped to a workspace: set ANTHROPIC_WORKSPACE_ID or use a workspace key.',
  no_credit: 'The Anthropic account has run out of credit.',
  model_unavailable: 'The translation model is not available for this key.',
  rate_limited: 'Too many requests to Claude right now; try again shortly.',
  unavailable: 'Claude is not reachable right now; try again later.',
  failed: 'The translation failed.',
}

export function unavailable(
  reason: TranslationUnavailableReason,
): TranslationStatus & { available: false } {
  return { available: false, reason, message: MESSAGES[reason] }
}

/** Maps an Anthropic SDK error to a reason the editor can show. */
export function classifyAnthropicError(
  err: unknown,
): TranslationStatus & { available: false } {
  const status = (err as { status?: unknown })?.status
  const message = String((err as { message?: unknown })?.message ?? '')
  if (typeof status !== 'number') return unavailable('unavailable')
  if (status === 401 || status === 403) return unavailable('invalid_key')
  if (status === 400 && /credit balance/i.test(message))
    return unavailable('no_credit')
  if (status === 400 && /workspace/i.test(message))
    return unavailable('workspace_required')
  if (status === 404) return unavailable('model_unavailable')
  if (status === 429) return unavailable('rate_limited')
  if (status >= 500) return unavailable('unavailable')
  return unavailable('failed')
}

/** Reasons that will not fix themselves on the next click. */
export function blocksTranslation(
  reason: TranslationUnavailableReason,
): boolean {
  return reason !== 'rate_limited' && reason !== 'failed'
}
