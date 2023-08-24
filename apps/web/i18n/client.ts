import { FlatNamespace, KeyPrefix } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import {
  FallbackNs,
  UseTranslationOptions,
  UseTranslationResponse,
} from 'react-i18next'

import {
  initialize,
  useClientTranslation as useClientTranslationLib,
} from '@sdlgr/i18n-client'

import { defaultNS, fallbackLng, languages } from './settings'

// on client side the normal singleton is ok
initialize({
  resourcesToBackend: resourcesToBackend(
    (language: string, namespace: string) =>
      import(`./locales/${language}/${namespace}.json`)
  ),
  lng: undefined,
  languages,
  defaultNS,
  fallbackLng,
})

export function useClientTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined
>(
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>
): UseTranslationResponse<FallbackNs<Ns>, KPrefix> {
  return useClientTranslationLib(ns, options, fallbackLng)
}
