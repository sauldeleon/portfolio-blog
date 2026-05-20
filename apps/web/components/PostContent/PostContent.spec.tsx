import { render, screen } from '@testing-library/react'

import { PostContent } from './PostContent'

jest.mock('./PostContent.styles', () => ({
  StyledArticle: ({ children }: { children: React.ReactNode }) => (
    <article data-testid="post-content">{children}</article>
  ),
}))

describe('PostContent', () => {
  it('renders children inside article', () => {
    render(<PostContent>Hello world</PostContent>)
    expect(screen.getByTestId('post-content')).toHaveTextContent('Hello world')
  })
})
