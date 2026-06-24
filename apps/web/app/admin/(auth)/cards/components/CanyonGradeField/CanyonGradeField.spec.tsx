import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { CanyonGradeField, composeGrade, parseGrade } from './CanyonGradeField'

jest.mock('@web/i18n/client', () => {
  const admin: Record<string, unknown> = jest.requireActual(
    '@web/i18n/locales/en/admin.json',
  )
  return {
    useClientTranslation: () => ({
      t: (key: string): string => {
        const val = key
          .split('.')
          .reduce<unknown>(
            (o, k) =>
              typeof o === 'object' && o !== null
                ? (o as Record<string, unknown>)[k]
                : undefined,
            admin,
          )
        return typeof val === 'string' ? val : key
      },
    }),
  }
})

jest.mock('@sdlgr/select', () => ({
  Select: ({
    value,
    onChange,
    options,
    'data-testid': testId,
  }: {
    value: string
    onChange: (v: string) => void
    options: Array<{ value: string; label: string }>
    'data-testid'?: string
  }) => (
    <div data-testid={testId}>
      <span data-testid={`${testId}-value`}>{value}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          data-testid={`${testId}-opt-${o.value}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
}))

describe('parseGrade', () => {
  it('returns blanks for undefined', () => {
    expect(parseGrade()).toEqual({ v: '', a: '', commitment: '' })
  })

  it('splits a full grade string', () => {
    expect(parseGrade('v4 a3 III')).toEqual({
      v: 'v4',
      a: 'a3',
      commitment: 'III',
    })
  })

  it('uppercases lowercase roman numerals', () => {
    expect(parseGrade('v4 a3 iv').commitment).toBe('IV')
  })

  it('ignores tokens it does not recognise', () => {
    expect(parseGrade('v4 foo 99')).toEqual({
      v: 'v4',
      a: '',
      commitment: '',
    })
  })
})

describe('composeGrade', () => {
  it('joins all three tokens', () => {
    expect(composeGrade({ v: 'v4', a: 'a3', commitment: 'III' })).toBe(
      'v4 a3 III',
    )
  })

  it('drops blank tokens', () => {
    expect(composeGrade({ v: 'v4', a: '', commitment: 'III' })).toBe('v4 III')
  })

  it('returns an empty string when all blank', () => {
    expect(composeGrade({ v: '', a: '', commitment: '' })).toBe('')
  })
})

describe('CanyonGradeField', () => {
  it('renders the three selects', () => {
    renderApp(<CanyonGradeField onChange={jest.fn()} idPrefix="bc" />)
    expect(screen.getByTestId('bc-grade-v')).toBeInTheDocument()
    expect(screen.getByTestId('bc-grade-a')).toBeInTheDocument()
    expect(screen.getByTestId('bc-grade-commitment')).toBeInTheDocument()
  })

  it('shows the parsed values', () => {
    renderApp(
      <CanyonGradeField value="v4 a3 III" onChange={jest.fn()} idPrefix="bc" />,
    )
    expect(screen.getByTestId('bc-grade-v-value')).toHaveTextContent('v4')
    expect(screen.getByTestId('bc-grade-a-value')).toHaveTextContent('a3')
    expect(screen.getByTestId('bc-grade-commitment-value')).toHaveTextContent(
      'III',
    )
  })

  it('composes the grade when the vertical select changes', () => {
    const onChange = jest.fn()
    renderApp(
      <CanyonGradeField value="a3 III" onChange={onChange} idPrefix="bc" />,
    )
    fireEvent.click(screen.getByTestId('bc-grade-v-opt-v2'))
    expect(onChange).toHaveBeenCalledWith('v2 a3 III')
  })

  it('composes the grade when the aqua select changes', () => {
    const onChange = jest.fn()
    renderApp(
      <CanyonGradeField value="v4 III" onChange={onChange} idPrefix="bc" />,
    )
    fireEvent.click(screen.getByTestId('bc-grade-a-opt-a5'))
    expect(onChange).toHaveBeenCalledWith('v4 a5 III')
  })

  it('composes the grade when the commitment select changes', () => {
    const onChange = jest.fn()
    renderApp(
      <CanyonGradeField value="v4 a3" onChange={onChange} idPrefix="bc" />,
    )
    fireEvent.click(screen.getByTestId('bc-grade-commitment-opt-IV'))
    expect(onChange).toHaveBeenCalledWith('v4 a3 IV')
  })
})
