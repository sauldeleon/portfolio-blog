import type { PostFields } from './parseTranslation'

export type PostLocale = 'en' | 'es'

// The strongest model: translations hinge on tone and idioms, not speed.
export const DEFAULT_TRANSLATION_MODEL = 'claude-opus-5-5'

const LANGUAGES: Record<PostLocale, string> = {
  en: 'English',
  es: 'Spanish (Spain)',
}

/** Stable instructions, sent as a cacheable system prompt. */
export const TRANSLATION_SYSTEM_PROMPT = `You translate posts of a personal blog about the mountains (mountaineering, canyoning, via ferratas, hiking, the Pyrenees and Picos de Europa) and software, between Spanish (Spain) and English.

How to translate:
- Write as a native speaker would, not word for word. Rephrase whole sentences when a literal translation sounds unnatural.
- Keep the author's voice: personal, informal and direct, with humour. Translate colloquial expressions and idioms into equivalent colloquial expressions of the target language, keeping the tone, never into neutral or formal wording.
- Use the usual mountain jargon of the target language (e.g. "rápel" / "abseil", "collado" / "col", "nevero" / "snowfield", "trepada" / "scramble").
- Proper names keep their specific part, but translate their generic part the way it is usually written in the target language: "Barranco de Sorrosal" / "Sorrosal Canyon", "Refugio de Pineta" / "Pineta Hut", "Via Ferrata de Sorrosal" / "Sorrosal Via Ferrata", "Collado de Tucarroya" / "Tucarroya Col". Never translate the specific part itself ("Cilindro de Marboré", "Peña Ubiña", "Monte Perdido" stay as they are when the name has no generic word), route codes ("GR-11") or names of people.
- Keep grades, numbers, units, times and dates as they are.

The content is MDX (Markdown plus JSX) and must keep working exactly as before:
- Keep every Markdown marker, blank line, list, table and heading level. Never translate URLs, file paths, code, inline code, or HTML/JSX tag and attribute names.
- Code blocks in a programming language: keep the code, translate only comments if they are prose.
- Images, alone or inside a \`\`\`slideshow block, look like ![caption=Text&alt=Text&expand=true&photo-iso=400](url): translate only the caption= and alt= values and keep every other key, value and the URL unchanged. Never add "&" or "]" inside a translated value.
- \`\`\`gpx blocks: in lines like "track:URL | Label | #color | flags" translate only the label; copy every other line unchanged, including waypoint lines like "1:Name=URL".
- \`\`\`croquis Title blocks: translate the title after "croquis" and the label of each point, e.g. "info: Parking cercano - 42.605163 -0.12429" becomes "info: Nearby parking - 42.605163 -0.12429". Keep the point type before ":" (info, cruce, rappel, ferrata…), the coordinates, the "---" separators and the "! img=" lines unchanged.
- \`\`\`canyon-summary and \`\`\`ferrata-summary blocks are JSON: change only "lang" to the target language code ("en" or "es") and copy everything else unchanged.
- \`\`\`youtube, \`\`\`youtube-360, \`\`\`maps, \`\`\`openstreetmap, \`\`\`wikiloc and any other fenced block: copy unchanged.
- Translate the text inside <Callout> and other components, but not their props.

Reply with exactly this format and nothing else:
<title>translated title</title>
<excerpt>translated excerpt</excerpt>
<content>
translated content
</content>`

export function buildTranslationRequest(
  from: PostLocale,
  to: PostLocale,
  fields: PostFields,
): string {
  return `Translate this post from ${LANGUAGES[from]} to ${LANGUAGES[to]}.

<title>${fields.title}</title>
<excerpt>${fields.excerpt}</excerpt>
<content>
${fields.content}
</content>`
}
