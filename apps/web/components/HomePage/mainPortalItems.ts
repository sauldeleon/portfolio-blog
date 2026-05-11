import { AnimatedElement } from '@web/components/AnimatedItem/AnimatedItem'
import {
  AnimatedItemKey,
  animatedItemMap,
} from '@web/utils/animatedItem/animatedItemMap'

const mainPortalKeys: AnimatedItemKey[] = [
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

export function getMainPortalItems(): AnimatedElement[] {
  return mainPortalKeys.map((iconName) => animatedItemMap[iconName])
}
