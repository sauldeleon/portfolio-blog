import { InitOptions } from 'i18next'

export const LANGUAGE_COOKIE = 'i18nextLng'

export type GetOptionsProps = {
  lng?: string
  ns?: string | string[]
  languages: string[]
  fallbackLng: string
  defaultNS: string | string[]
}

export function getOptions({
  lng,
  ns,
  languages,
  fallbackLng,
  defaultNS,
}: GetOptionsProps): InitOptions {
  return {
    // debug: true,
    supportedLngs: languages,
    preload: languages,
    fallbackLng,
    lng: lng ?? fallbackLng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: ns ?? defaultNS,
    // backend: {
    //   projectId: '01b2e5e8-6243-47d1-b36f-963dbb8bcae3'
    // }
  }
}
