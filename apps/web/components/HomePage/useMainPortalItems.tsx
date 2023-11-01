import { useMemo } from 'react'

import { AnimatedElement } from '@web/components/AnimatedItem/AnimatedItem'
import {
  AnimatedItemKey,
  animatedItemMap,
} from '@web/utils/animatedItem/animatedItemMap'

const mainPortalItems: AnimatedItemKey[] = [
  'nodeJS',
  'css3',
  'github',
  'typescript',
  'nextJS',
  'reactJS',
  'mongoDB',
  'reactQuery',
  'jest',
  'nx',
  'yarn',
  'scottPilgrim',
  'xataIO',
  'styledComponents',
  'eslint',
  'cypress',
  'prettier',
  'docker',
  'html',
  'javascript',
  'npm',
  'git',
  'chrome',
  'vscode',
  'materialUI',
  'postgreSql',
  'sentry',
  'storybook',
  'webpack',
  'gitlab',
  'json',
  'vercel',
  'auth0',
  'spiderMan',
  'halfLife',
  'bf2042',
]

export function useMainPortalItems() {
  const items: AnimatedElement[] = useMemo(
    () => mainPortalItems.map((iconName) => animatedItemMap[iconName]),
    [],
  )

  return items
}
