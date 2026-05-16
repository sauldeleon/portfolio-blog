import styled from 'styled-components'

import { Button } from '@sdlgr/button'

export const StyledSidebar = styled.div<{ $open: boolean }>`
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 50%;
  background: ${({ theme }) => theme.colors.black};
  border-left: 1px solid rgba(251, 251, 251, 0.1);
  z-index: 900;
  display: flex;
  flex-direction: column;
  transform: translateX(${({ $open }) => ($open ? '0' : '100%')});
  transition: transform 0.3s ease;
  overflow: hidden;
`

export const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  flex-shrink: 0;
`

export const StyledTitle = styled.h2`
  font-size: 0.9rem;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
`

export const StyledCloseButton = styled(Button).attrs({ variant: 'text' })`
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  font-size: 1rem;
  padding: 0.25rem;
  line-height: 1;

  &::after {
    display: none;
  }

  &:hover {
    opacity: 1;
  }
`

export const StyledSearch = styled.input`
  width: 100%;
  background: rgba(251, 251, 251, 0.05);
  border: 1px solid rgba(251, 251, 251, 0.1);
  border-radius: 2px;
  padding: 0.5rem 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.7rem;
  outline: none;
  box-sizing: border-box;

  &::placeholder {
    opacity: 0.4;
  }

  &:focus {
    border-color: rgba(251, 251, 251, 0.25);
  }
`

export const StyledSearchWrapper = styled.div`
  padding: 0.75rem 1.5rem;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(251, 251, 251, 0.06);
`

export const StyledContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem;
`

export const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.75rem;
`

export const StyledImageItem = styled(Button).attrs({ variant: 'ghost' })`
  background: rgba(251, 251, 251, 0.03);
  border: 1px solid rgba(251, 251, 251, 0.08);
  border-radius: 2px;
  overflow: hidden;
  padding: 0;
  text-align: left;
  transition: border-color 0.15s;
  flex-direction: column;
  align-items: unset;

  &:hover {
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledImagePreview = styled.div`
  width: 100%;
  height: 120px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

export const StyledImageMeta = styled.div`
  padding: 0.4rem 0.5rem;
  display: flex;
  justify-content: space-between;
  gap: 0.25rem;
  border-top: 1px solid rgba(251, 251, 251, 0.06);
`

export const StyledMetaRow = styled.span`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  font-family: inherit;
`

export const StyledImageName = styled.span`
  display: block;
  padding: 0 0.5rem 0.4rem;
  font-size: 0.6rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.7;
  font-family: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  box-sizing: border-box;
`

export const StyledEmptyState = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  text-align: center;
  padding: 2rem 0;
  margin: 0;
`
