import 'styled-components'

import { MainTheme } from '@sdlgr/main-theme'

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends MainTheme {}
}
