import Link from 'next/link'
import styled, { css } from 'styled-components'

const linkStyles = css``

export const StyledLink = styled.a`
  ${linkStyles}
`

export const StyledNextLink = styled(Link)`
  ${linkStyles}
`
