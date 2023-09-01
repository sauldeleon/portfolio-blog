import { AppProgressBar } from 'next-nprogress-bar'
import { Suspense } from 'react'

import { mainTheme } from '@sdlgr/main-theme'

export function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <AppProgressBar
        color={mainTheme.colors.white}
        height="1px"
        options={{
          showSpinner: false,
          template:
            '<div data-testid="app-progress-bar" class="bar" role="bar"><div class="peg"></div></div>',
        }}
        shallowRouting
      />
    </Suspense>
  )
}
