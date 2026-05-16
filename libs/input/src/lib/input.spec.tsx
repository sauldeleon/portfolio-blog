import { render, screen } from '@testing-library/react'
import { createRef } from 'react'

import { RenderProviders } from '@sdlgr/test-utils'

import { FieldGroup, FieldHelper, FieldLabel, Input, Textarea } from './input'

function wrap(ui: React.ReactElement) {
  return render(ui, { wrapper: RenderProviders })
}

describe('FieldGroup', () => {
  it('renders children', () => {
    wrap(<FieldGroup data-testid="fg">hello</FieldGroup>)
    expect(screen.getByTestId('fg')).toHaveTextContent('hello')
  })
})

describe('FieldLabel', () => {
  it('renders label text', () => {
    wrap(<FieldLabel>Title</FieldLabel>)
    expect(screen.getByText('Title')).toBeInTheDocument()
  })

  it('does not render required marker by default', () => {
    wrap(<FieldLabel>Email</FieldLabel>)
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('renders required marker when required is true', () => {
    wrap(<FieldLabel required>Email</FieldLabel>)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('marker is aria-hidden', () => {
    wrap(<FieldLabel required>Email</FieldLabel>)
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true')
  })

  it('forwards htmlFor', () => {
    wrap(<FieldLabel htmlFor="my-input">Name</FieldLabel>)
    expect(screen.getByText('Name')).toHaveAttribute('for', 'my-input')
  })
})

describe('Input', () => {
  it('renders an input element', () => {
    wrap(<Input data-testid="inp" />)
    expect(screen.getByTestId('inp')).toBeInTheDocument()
  })

  it('forwards value and placeholder', () => {
    wrap(
      <Input
        value="hello"
        placeholder="type here"
        onChange={() => undefined}
      />,
    )
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('type here')).toBeInTheDocument()
  })

  it('forwards type', () => {
    wrap(<Input type="number" data-testid="num" />)
    expect(screen.getByTestId('num')).toHaveAttribute('type', 'number')
  })
})

describe('Textarea', () => {
  it('renders a textarea element', () => {
    wrap(<Textarea data-testid="ta" />)
    expect(screen.getByTestId('ta')).toBeInTheDocument()
  })

  it('forwards rows and placeholder', () => {
    wrap(<Textarea rows={5} placeholder="write here" />)
    expect(screen.getByPlaceholderText('write here')).toHaveAttribute(
      'rows',
      '5',
    )
  })

  it('forwards ref to the textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>()
    wrap(<Textarea ref={ref} data-testid="ta-ref" />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})

describe('FieldHelper', () => {
  it('renders helper text', () => {
    wrap(<FieldHelper>Separate with commas</FieldHelper>)
    expect(screen.getByText('Separate with commas')).toBeInTheDocument()
  })
})
