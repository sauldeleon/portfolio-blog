'use client'

import i18next, { FlatNamespace, KeyPrefix } from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { useContext, useEffect, useState } from 'react'
import {
  FallbackNs,
  UseTranslationOptions,
  UseTranslationResponse,
  initReactI18next,
  useTranslation as useTranslationOrg,
} from 'react-i18next'

import { LanguageContext } from '@web/context/LanguageProvider'

import { getOptions, languages } from './settings'

const runsOnServerSide = typeof window === 'undefined'

// on client side the normal singleton is ok
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: runsOnServerSide ? languages : [],
  })

export function useTranslation<
  Ns extends FlatNamespace,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined
>(
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>
): UseTranslationResponse<FallbackNs<Ns>, KPrefix> {
  const { language } = useContext(LanguageContext)

  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret
  if (runsOnServerSide && language && i18n.resolvedLanguage !== language) {
    i18n.changeLanguage(language)
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
      if (!language || i18n.resolvedLanguage === language) return
      i18n.changeLanguage(language)
    }, [language, i18n])
  }

  return ret
}
