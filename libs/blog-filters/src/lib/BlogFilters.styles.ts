import styled, { css } from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledBlogFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const StyledFilterRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  position: relative;
`

export const StyledDropdownWrapper = styled.div`
  position: relative;

  @media (max-width: 600px) {
    position: static;
  }
`

export const StyledDropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
  }
`

export const StyledDropdownPanel = styled.div<{ $wide?: boolean }>`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.black};
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.75rem;
  min-width: ${({ $wide }) => ($wide ? '320px' : '220px')};
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 600px) {
    left: 0;
    right: 0;
    min-width: unset;
    width: 100%;
    box-sizing: border-box;
  }
`

export const StyledTagSearchInput = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.5rem;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.5);
  }
`

export const StyledApplyButton = styled(Button)`
  width: 100%;
  justify-content: center;
`

export const StyledActiveFiltersRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
`

export const StyledActiveChip = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
  }
`

export const StyledClearAllButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-family: inherit;
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.4rem;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.white};
  }
`

export const StyledChipList = styled.ul`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
`

export const StyledChip = styled(Button).attrs({ variant: 'label' })<{
  $small?: boolean
}>`
  ${({ $small }) =>
    $small &&
    css`
      font-size: 0.55rem;
      padding: 0.125rem 0.4rem;
    `}
`
