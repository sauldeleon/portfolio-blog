import { PropsWithChildren } from 'react'

type ParamsRouteProps<T> = {
  params: T
}

export type PageRouteProps<
  RouteParams = Record<string, string>,
  SearchParams = Record<string, string>,
> = ParamsRouteProps<RouteParams> & {
  searchParams: SearchParams
}

export type LayoutRouteProps<RouteParams = Record<string, string>> =
  ParamsRouteProps<RouteParams> & Required<PropsWithChildren>

type LngProps = { lng: 'en' | 'es' }
export type PageRouteLangProps<SearchParams = Record<string, string>> =
  PageRouteProps<LngProps, SearchParams>
export type LayoutRouteLangProps = LayoutRouteProps<LngProps>
