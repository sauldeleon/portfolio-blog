import { fireEvent, screen } from '@testing-library/react'

import { renderApp } from '@sdlgr/test-utils'

import { CoverImageInput } from './CoverImageInput'

const defaultProps = {
  label: 'Cover Image',
  placeholder: 'No cover image selected',
  clearTitle: 'Remove cover image',
  value: '',
  onPick: jest.fn(),
  onClear: jest.fn(),
}

describe('CoverImageInput', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders label and input', () => {
    renderApp(<CoverImageInput {...defaultProps} />)
    expect(screen.getByText('Cover Image')).toBeInTheDocument()
    expect(screen.getByTestId('cover-image-input')).toBeInTheDocument()
  })

  it('shows placeholder when value is empty', () => {
    renderApp(<CoverImageInput {...defaultProps} value="" />)
    expect(screen.getByTestId('cover-image-input')).toHaveAttribute(
      'placeholder',
      'No cover image selected',
    )
  })

  it('shows filename only (last path segment) when value is a path', () => {
    renderApp(
      <CoverImageInput {...defaultProps} value="blog/subfolder/my-image" />,
    )
    expect(screen.getByTestId('cover-image-input')).toHaveValue('my-image')
  })

  it('shows value as-is when it has no slash', () => {
    renderApp(<CoverImageInput {...defaultProps} value="my-image" />)
    expect(screen.getByTestId('cover-image-input')).toHaveValue('my-image')
  })

  it('does not show clear button when value is empty', () => {
    renderApp(<CoverImageInput {...defaultProps} value="" />)
    expect(
      screen.queryByTestId('clear-cover-image-button'),
    ).not.toBeInTheDocument()
  })

  it('shows clear button when value is set', () => {
    renderApp(<CoverImageInput {...defaultProps} value="blog/my-image" />)
    expect(screen.getByTestId('clear-cover-image-button')).toBeInTheDocument()
  })

  it('calls onPick when input is clicked', () => {
    renderApp(<CoverImageInput {...defaultProps} />)
    fireEvent.click(screen.getByTestId('cover-image-input'))
    expect(defaultProps.onPick).toHaveBeenCalledTimes(1)
  })

  it('calls onClear when clear button is clicked', () => {
    renderApp(<CoverImageInput {...defaultProps} value="blog/my-image" />)
    fireEvent.click(screen.getByTestId('clear-cover-image-button'))
    expect(defaultProps.onClear).toHaveBeenCalledTimes(1)
  })

  it('clear button has correct title attribute', () => {
    renderApp(<CoverImageInput {...defaultProps} value="blog/my-image" />)
    expect(screen.getByTestId('clear-cover-image-button')).toHaveAttribute(
      'title',
      'Remove cover image',
    )
  })
})
