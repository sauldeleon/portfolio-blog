import { buildTranslationRequest } from './translatePost'

describe('buildTranslationRequest', () => {
  it('names both languages and wraps every field', () => {
    const text = buildTranslationRequest('es', 'en', {
      title: 'Título',
      excerpt: 'Resumen',
      content: '## Hola',
    })
    expect(text).toContain('from Spanish (Spain) to English')
    expect(text).toContain('<title>Título</title>')
    expect(text).toContain('<excerpt>Resumen</excerpt>')
    expect(text).toContain('<content>\n## Hola\n</content>')
  })
})
