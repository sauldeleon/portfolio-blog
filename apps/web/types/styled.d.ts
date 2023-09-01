import 'styled-components'

import { MainTheme } from '@sdlgr/main-theme'

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends MainTheme {}
}
