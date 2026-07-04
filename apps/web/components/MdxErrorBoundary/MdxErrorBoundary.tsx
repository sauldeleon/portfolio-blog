'use client'

import { Component, type ReactNode } from 'react'

interface MdxErrorBoundaryProps {
  children: ReactNode
  /** Rendered when the MDX subtree throws; defaults to nothing. */
  fallback?: ReactNode
}

interface MdxErrorBoundaryState {
  hasError: boolean
}

/**
 * Renders nothing (or a fallback) when the MDX subtree fails to render — e.g. a
 * post saved with an embed whose component is not deployed yet, malformed
 * content, or hand-authored JSX referencing an unknown component. Keeps a
 * single incompatible element from crashing the whole page in production.
 */
export class MdxErrorBoundary extends Component<
  MdxErrorBoundaryProps,
  MdxErrorBoundaryState
> {
  state: MdxErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): MdxErrorBoundaryState {
    return { hasError: true }
  }

  render(): ReactNode {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
