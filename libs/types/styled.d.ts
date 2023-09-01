import 'styled-components'
import { CSSProp } from 'styled-components'

import { MainTheme } from '@sdlgr/main-theme'

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends MainTheme {}
}

declare module 'react' {
  interface DOMAttributes {
    css?: CSSProp
  }
}

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      css?: CSSProp
    }
  }
}
