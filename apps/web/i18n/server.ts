import { FlatNamespace, KeyPrefix } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { FallbackNs } from 'react-i18next'

import { useServerTranslation as useServerTranslationLib } from '@sdlgr/i18n-server'

import { defaultNS, fallbackLng, languages } from './settings'

interface UseServerTranslationProps<Ns, KPrefix> {
  ns?: Ns
  language?: string
  options?: { keyPrefix?: KPrefix }
}

export function useServerTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(props?: UseServerTranslationProps<Ns, KPrefix>) {
  const { ns, language, options = {} } = props ?? {}
  return useServerTranslationLib(
    {
      language,
      fallbackLng,
      defaultNS,
      languages,
      resourcesToBackend: resourcesToBackend(
        (language: string, namespace: string) =>
          import(`./locales/${language}/${namespace}.json`),
      ),
    },
    ns,
    options,
  )
}

export const getServerTranslation = useServerTranslation
