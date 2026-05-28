import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Input } from '@sdlgr/input'

export const StyledInputWrapper = styled.div`
  position: relative;
`

export const StyledPickerInput = styled(Input)<{ $hasValue: boolean }>`
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
  ${({ $hasValue }) => $hasValue && 'padding-right: 1.5rem;'}
`

export const StyledClearButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
})`
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  color: rgba(251, 251, 251, 0.5);
  font-size: 0.9rem;
  line-height: 1;
  padding: 0.2rem 0.3rem;

  &:hover:not(:disabled) {
    border: none;
  }
`
