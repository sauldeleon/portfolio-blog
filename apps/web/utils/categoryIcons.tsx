import React, { type ComponentType, type SVGProps } from 'react'

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

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const categoryIconMap: Record<string, IconComponent> = {
  canyoning: CanyoningIcon,
  carpentry: CarpentryIcon,
  coding: TechIcon,
  gaming: GameControllerIcon,
  mountaineering: HikeIcon,
  movies: MoviesIcon,
  photography: CameraIcon,
  speleology: SpeleologyIcon,
  other: TagIcon,
}

export function getCategoryIcon(slug: string): IconComponent {
  return categoryIconMap[slug] ?? FileIcon
}

export interface CategoryIconRendererProps extends SVGProps<SVGSVGElement> {
  slug: string
}

export function CategoryIconRenderer({
  slug,
  ...props
}: CategoryIconRendererProps) {
  return React.createElement(categoryIconMap[slug] ?? FileIcon, props)
}
