import { InitOptions } from 'i18next'

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
    supportedLngs: languages,
    preload: languages,
    fallbackLng,
    lng: lng ?? fallbackLng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: ns ?? defaultNS,
  }
}
