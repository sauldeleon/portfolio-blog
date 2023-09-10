import Link from 'next/link'
import styled from 'styled-components'

import { Heading, Label } from '@sdlgr/typography'

export const StyledModalHeading = styled(Heading)`
  margin-bottom: 40px;
`

export const StyledLabel = styled(Label)`
  margin: 20px 0 10px;
`

export const StyledPropertyWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const StyledIconLink = styled(Link)`
  ${({ theme }) => theme.helpers.textBottomBorder.removeAfter}
`

export const StyledList = styled.ul`
  list-style: none;
  display: flex;
  gap: 1rem;
`
