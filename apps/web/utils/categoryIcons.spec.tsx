import { render, screen } from '@testing-library/react'

import {
  CameraIcon,
  CanyoningIcon,
  CarpentryIcon,
  FileIcon,
  GameControllerIcon,
  HikeIcon,
  MoviesIcon,
  SpeleologyIcon,
  TagIcon,
  TechIcon,
} from '@sdlgr/assets'

import { CategoryIconRenderer, getCategoryIcon } from './categoryIcons'

describe('getCategoryIcon', () => {
  it.each([
    ['canyoning', CanyoningIcon],
    ['carpentry', CarpentryIcon],
    ['coding', TechIcon],
    ['gaming', GameControllerIcon],
    ['mountaineering', HikeIcon],
    ['movies', MoviesIcon],
    ['photography', CameraIcon],
    ['speleology', SpeleologyIcon],
    ['other', TagIcon],
  ])('returns correct icon for slug "%s"', (slug, expected) => {
    expect(getCategoryIcon(slug)).toBe(expected)
  })

  it('returns FileIcon for unknown slug', () => {
    expect(getCategoryIcon('unknown-category')).toBe(FileIcon)
  })
})

describe('CategoryIconRenderer', () => {
  it('renders an icon for a known slug', () => {
    render(<CategoryIconRenderer slug="coding" data-testid="icon" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders a fallback icon for an unknown slug', () => {
    render(<CategoryIconRenderer slug="unknown" data-testid="icon" />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
