import React from 'react'

import { parseRichText } from './parseRichText'

describe('parseRichText', () => {
  it('returns plain text as-is', () => {
    const result = parseRichText('Hello world', {})
    expect(result).toEqual(['Hello world'])
  })

  it('handles bold tags', () => {
    const result = parseRichText('Use <bold>React</bold> here', {
      bold: (key, text) => <b key={key}>{text}</b>,
    })
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('Use ')
    expect(result[2]).toBe(' here')
  })

  it('handles italic tags', () => {
    const result = parseRichText('<italic>note</italic> done', {
      italic: (key, text) => <i key={key}>{text}</i>,
    })
    expect(result).toHaveLength(3)
    expect(result[0]).toBe('')
    expect(result[2]).toBe(' done')
  })

  it('handles linkComponent tags', () => {
    const result = parseRichText('read <linkComponent>more</linkComponent>', {
      linkComponent: (key, text) => <a key={key}>{text}</a>,
    })
    expect(result).toHaveLength(3)
  })

  it('returns unmatched tags as plain text when handler missing', () => {
    const result = parseRichText('Use <bold>React</bold> here', {})
    expect(result).toEqual(['Use ', '<bold>React</bold>', ' here'])
  })

  it('handles text with no markup', () => {
    const result = parseRichText('plain text only', {
      bold: (k, t) => <b key={k}>{t}</b>,
    })
    expect(result).toEqual(['plain text only'])
  })
})
