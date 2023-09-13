import Link from 'next/link'
import styled, { css } from 'styled-components'

const linkStyles = css`
  position: relative;
  ${({ theme }) => theme.helpers.textBottomBorder.afterShared}
  ${({ theme }) => theme.helpers.textBottomBorder.transform()}
  ${({ theme }) => theme.helpers.noLinkUnderline}
  ${({ theme }) => theme.helpers.focusVisible};
`

export const StyledLink = styled.a`
  ${linkStyles}
`

export const StyledNextLink = styled(Link)`
  ${linkStyles}
`
