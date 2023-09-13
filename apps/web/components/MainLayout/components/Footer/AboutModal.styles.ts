import styled from 'styled-components'

import { Link } from '@sdlgr/link'
import { Modal } from '@sdlgr/modal'
import { Heading, Label } from '@sdlgr/typography'

export const StyledModalHeading = styled(Heading)`
  margin-bottom: 40px;
`

export const StyledLabel = styled(Label)`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 20px 0 10px;
`

export const StyledPropertyWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
`

export const StyledIconLink = styled(Link)`
  ${({ theme }) => theme.helpers.textBottomBorder.removeAfter}
  svg {
    display: flex;
  }
`

export const StyledList = styled.ul`
  list-style: none;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`

export const StyledModal = styled(Modal)`
  ${({ theme }) => theme.helpers.border.gradientShared}
  ${({ theme }) => theme.helpers.border.gradientRight}
`
