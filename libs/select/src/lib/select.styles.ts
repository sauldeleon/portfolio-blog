import styled, { css } from 'styled-components'

export const StyledWrapper = styled.div`
  position: relative;
`

export const StyledTrigger = styled.button<{
  $open: boolean
  $hasValue: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid
    ${({ $open, theme }) =>
      $open ? theme.colors.green : 'rgba(251, 251, 251, 0.2)'};
  padding: 0.5rem 0;
  color: ${({ $hasValue, theme }) =>
    $hasValue ? theme.colors.white : 'rgba(251,251,251,0.25)'};
  font-family: inherit;
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:focus-visible {
    border-bottom-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledChevron = styled.span<{ $open: boolean }>`
  font-size: 0.75rem;
  opacity: 0.5;
  transition: transform 0.15s;
  flex-shrink: 0;

  ${({ $open }) =>
    $open &&
    css`
      transform: rotate(180deg);
      opacity: 1;
    `}
`

export const StyledDropdown = styled.ul`
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: #111;
  border: 1px solid rgba(251, 251, 251, 0.1);
  border-radius: 2px;
  padding: 0.25rem 0;
  margin: 0;
  list-style: none;
  z-index: 100;
  max-height: 12rem;
  overflow-y: auto;
`

export const StyledOption = styled.li<{
  $selected?: boolean
  $disabled?: boolean
}>`
  padding: 0.45rem 0.75rem;
  font-size: 0.8rem;
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.green : theme.colors.white};
  background: ${({ $selected }) =>
    $selected ? 'rgba(152,223,214,0.06)' : 'transparent'};
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.1s;

  &:hover {
    ${({ $disabled }) =>
      !$disabled &&
      css`
        background: rgba(251, 251, 251, 0.05);
      `}
  }
`
