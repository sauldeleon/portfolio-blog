/* istanbul ignore file */
import i18next, { BackendModule, FlatNamespace, KeyPrefix } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { useContext, useEffect, useState } from 'react'
import {
  FallbackNs,
  UseTranslationOptions,
  UseTranslationResponse,
  initReactI18next,
  useTranslation as useTranslationOrg,
} from 'react-i18next'

import {
  GetOptionsProps,
  STORAGE_I18N_KEY,
  getOptions,
} from '@sdlgr/i18n-config'
import { LanguageContext } from '@sdlgr/i18n-tools'

const runsOnServerSide = typeof window === 'undefined'

type InitializeProps = GetOptionsProps & {
  resourcesToBackend: BackendModule<object>
}

export function initialize({ resourcesToBackend, ...rest }: InitializeProps) {
  // on client side the normal singleton is ok
  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend)
    .init({
      ...getOptions(rest),
      lng: undefined, // let detect the language on client side
      detection: {
        lookupLocalStorage: STORAGE_I18N_KEY,
        order: ['path'],
        caches: [],
      },
      preload: runsOnServerSide ? rest.languages : [],
    })
}

export function useClientTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined
>(
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>,
  fallbackLng?: string
): UseTranslationResponse<FallbackNs<Ns>, KPrefix> {
  const { language } = useContext(LanguageContext)
  const lng = language || fallbackLng
  const runsOnServerSide = typeof window === 'undefined'
  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret
  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activeLng === i18n.resolvedLanguage) return
      setActiveLng(i18n.resolvedLanguage)
    }, [activeLng, i18n.resolvedLanguage])

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!lng || i18n.resolvedLanguage === lng) return
      i18n.changeLanguage(lng)
    }, [lng, i18n])
  }

  return ret
}
