import { FlatNamespace, KeyPrefix } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { FallbackNs } from 'react-i18next'

import { useServerTranslation as useServerTranslationLib } from '@sdlgr/i18n-server'

import { defaultNS, fallbackLng, languages } from './settings'

export function useServerTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined
>(ns?: Ns, options: { keyPrefix?: KPrefix } = {}) {
  return useServerTranslationLib(
    {
      fallbackLng,
      defaultNS,
      languages,
      resourcesToBackend: resourcesToBackend(
        (language: string, namespace: string) =>
          import(`./locales/${language}/${namespace}.json`)
      ),
    },
    ns,
    options
  )
}

export const getServerTranslation = useServerTranslation
