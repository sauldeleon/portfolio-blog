import { GlobalStyle } from './GlobalGeneric'
import { GlobalReset } from './GlobalReset'
import { GlobalTypography } from './GlobalTypography'

export function GlobalStyles() {
  return (
    <>
      <GlobalReset />
      <GlobalStyle />
      <GlobalTypography />
    </>
  )
}
