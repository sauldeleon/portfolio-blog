import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Matcher } from '@testing-library/dom/types/matches'
import {
  RenderOptions,
  RenderResult,
  queryAllByAttribute as _queryAllByAttribute,
  queryByAttribute as _queryByAttribute,
  act,
  render,
  screen,
} from '@testing-library/react'
import { RouterContext } from 'next/dist/shared/lib/router-context'
import Router, { NextRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'

import { LanguageContextProvider } from '@sdlgr/i18n-config'
import { mainTheme } from '@sdlgr/main-theme'

export type MatcherCustomFnParams = {
  content: string
  element: Element | null
}

/* istanbul ignore next */
export const renderWithTheme = (children: ReactNode): RenderResult => {
  return render(<ThemeProvider theme={mainTheme}>{children}</ThemeProvider>)
}

/* istanbul ignore next */
export function RenderProviders({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageContextProvider value={{ language: 'en' }}>
        <ThemeProvider theme={mainTheme}>{children}</ThemeProvider>
      </LanguageContextProvider>
    </QueryClientProvider>
  )
}

/* istanbul ignore next */
export const renderApp = (
  children: ReactNode,
  options?: Omit<RenderOptions, 'queries'>
) => {
  return render(<RenderProviders>{children}</RenderProviders>, options)
}

/**
 * Generic function to get element by attribute and value
 * @example queryByAttribute('id')(baseElement, 'element-id')
 * @param {string} attr
 * @return {any}
 */
export function queryByAttribute(attr: string) {
  return _queryByAttribute.bind(null, attr)
}

/**
 * Generic function to get all elements by attribute and value
 * @example queryByAttribute('class')(baseElement, 'element-class')
 * @param {string} attr
 * @returns {any}
 */
export function queryAllByAttribute(attr: string) {
  return _queryAllByAttribute.bind(null, attr)
}

/**
 * Generic function to get element by attribute and value
 * @example getByAttribute('id')(baseElement, 'element-id')
 * @param {string} attr
 * @return {any}
 */
export function getByAttribute(attr: string) {
  return _queryByAttribute.bind(null, attr)
}

/**
 * Generic function to get all elements by attribute and value
 * @example getByAttribute('class')(baseElement, 'element-class')
 * @param {string} attr
 * @returns {any}
 */
export function getAllByAttribute(attr: string) {
  return _queryAllByAttribute.bind(null, attr)
}

/**
 * Shortcut version for queryByAttribute, but specific for id
 * @param {HTMLElement} container
 * @param {string} id
 * @return {any}
 */
export function getById(container: HTMLElement, id: string) {
  return queryByAttribute('id')(container, id) as Element
}

/**
 * Shortcut version for queryByAttribute, but specific for class name
 * @param {HTMLElement} container
 * @param {string} className
 * @return {any}
 */
export function getByClassName(container: HTMLElement, className: string) {
  return queryByAttribute('class')(container, className) as Element
}

function matcherCustomFn(
  tag: string,
  matcher: Matcher,
  { element, content }: MatcherCustomFnParams
) {
  const isTag = element?.tagName.toUpperCase() === tag.toUpperCase()
  let matching = false
  if (isTag) {
    matching = content === matcher
    /* istanbul ignore else*/
    if (typeof matcher === 'function') {
      matching = matcher(content, element)
    } else if (matcher instanceof RegExp) {
      matching = matcher.test(content)
    }
  }
  return matching && isTag
}

/**
 * Get 1 element by tag and text
 * @param {string} tag
 * @param {Matcher} matcher
 * @return {any}
 */
export function getByTagAndText(tag: string, matcher: Matcher) {
  return screen.getByText((content, element) =>
    matcherCustomFn(tag, matcher, { content, element })
  )
}

/**
 * Get multiple elements by tag and text
 * @param {string} tag
 * @param {Matcher} matcher
 * @return {any}
 */
export function getAllByTagAndText(tag: string, matcher: Matcher) {
  return screen.getAllByText((content, element) =>
    matcherCustomFn(tag, matcher, { content, element })
  )
}

/**
 * Mock Math.random() to return a specific value
 * @param {number} value
 */
export function mockRandom(value = 0.1234) {
  const mockMath = Object.create(global.Math)
  mockMath.random = () => value
  global.Math = mockMath
}

/**
 * Hook to use in test to ensure "last" render is called
 */
export function useWithRefreshInTest() {
  const [withRefreshInTest, setWithRefreshInTest] = useState(false)

  useEffect(() => {
    // Change state to "rerender" the component
    setWithRefreshInTest(true)
  }, [])

  return withRefreshInTest
}

export { render } from '@testing-library/react'

/* istanbul ignore next */
export const awaitAllAsync = async () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 0)))

/* istanbul ignore next */
export function renderWithNextRouter(
  children: ReactNode,
  options?: Partial<NextRouter>
) {
  return renderWithTheme(
    <RouterContext.Provider value={{ ...Router, ...options }}>
      {children}
    </RouterContext.Provider>
  )
}
