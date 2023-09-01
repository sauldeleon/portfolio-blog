'use client'

import { useServerInsertedHTML } from 'next/navigation'
import React, { useState } from 'react'
import {
  ServerStyleSheet,
  StyleSheetManager,
  ThemeProvider,
} from 'styled-components'

import { mainTheme } from '@sdlgr/main-theme'

import { GlobalStyles } from '@web/components/GlobalStyles/GlobalStyles'

export default function StyledComponentsRegistry({
  children,
}: {
  children: React.ReactNode
}) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  /* istanbul ignore next */
  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    return <>{styles}</>
  })

  const styledLayout = (
    <ThemeProvider theme={mainTheme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  )

  /* istanbul ignore else */
  if (typeof window !== 'undefined') return styledLayout

  /* istanbul ignore next */
  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {styledLayout}
    </StyleSheetManager>
  )
}
