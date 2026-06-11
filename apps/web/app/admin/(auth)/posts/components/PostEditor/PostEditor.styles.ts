import styled from 'styled-components'

import { Button } from '@sdlgr/button'
import { Textarea } from '@sdlgr/input'

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

export const StyledPageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`

export const StyledHeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

export const StyledBackLink = styled.a`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.45;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    opacity: 0.8;
  }
`

export const StyledTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const StyledHeading = styled.h1`
  font-size: 1.25rem;
  font-weight: 400;
  margin: 0;
  color: ${({ theme }) => theme.colors.white};
`

export const StyledStatusBadge = styled.span<{
  $status: 'draft' | 'published' | 'archived'
}>`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: inherit;
  color: ${({ $status, theme }) =>
    $status === 'published'
      ? theme.colors.black
      : $status === 'draft'
        ? theme.colors.black
        : theme.colors.white};
  background: ${({ $status, theme }) =>
    $status === 'published'
      ? theme.colors.green
      : $status === 'draft'
        ? theme.colors.yellow
        : 'rgba(251,251,251,0.1)'};
  opacity: ${({ $status }) => ($status === 'archived' ? 0.5 : 1)};
`

export const StyledActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`

export const StyledSaveButton = styled(Button).attrs({
  variant: 'inverted',
  size: 'xs',
})`
  padding: 0.25rem 0.875rem;
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;

  &:disabled {
    pointer-events: none;
  }
`

export const StyledPublishButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'success',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledArchiveButton = styled(Button).attrs({
  variant: 'ghost',
  size: 'xs',
  colorScheme: 'danger',
})`
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledLocaleTabs = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  margin-bottom: 1.5rem;
`

export const StyledLocaleTab = styled(Button).attrs({
  variant: 'ghost',
})<{ $active: boolean }>`
  border: none;
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.green : 'transparent')};
  padding: 0.5rem 1rem;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.green : theme.colors.white};
  opacity: ${({ $active }) => ($active ? 1 : 0.4)};
  transition:
    border-color 0.15s,
    color 0.15s,
    opacity 0.15s;
  margin-bottom: -1px;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: ${({ $active, theme }) =>
      $active ? theme.colors.green : 'transparent'};
  }
`

export const StyledEditorLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (width >= 900px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const StyledEditorPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

export const StyledPreviewPane = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 300px;
  border: 1px solid rgba(251, 251, 251, 0.06);
  border-radius: 2px;
  overflow: hidden;
`

export const StyledPreviewTabsBar = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  flex-shrink: 0;
`

export const StyledPreviewTab = styled(Button).attrs({
  variant: 'ghost',
})<{ $active: boolean }>`
  border: none;
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.green : 'transparent')};
  padding: 0.5rem 1rem;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.green : theme.colors.white};
  opacity: ${({ $active }) => ($active ? 1 : 0.4)};
  transition:
    border-color 0.15s,
    color 0.15s,
    opacity 0.15s;
  margin-bottom: -1px;

  &:hover:not(:disabled) {
    opacity: 1;
    border-color: ${({ $active, theme }) =>
      $active ? theme.colors.green : 'transparent'};
  }
`

export const StyledPreviewContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`

export const StyledMobileFrame = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 390px;
  border: 6px solid rgba(251, 251, 251, 0.12);
  border-radius: 40px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.black};

  &::before {
    content: '';
    display: block;
    width: 80px;
    height: 6px;
    background: rgba(251, 251, 251, 0.12);
    border-radius: 3px;
    margin: 0.75rem auto;
  }
`

export const StyledMobileContent = styled.div`
  padding: 0.75rem 1rem 2rem;
  overflow-y: auto;
  max-height: 70vh;
  cursor: pointer;
`

export const StyledContentTextarea = styled(Textarea)`
  min-height: 400px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
`

export const StyledMarkdownHint = styled.details`
  margin-top: 0.5rem;

  summary {
    font-size: 0.6rem;
    color: rgba(251, 251, 251, 0.3);
    cursor: pointer;
    user-select: none;
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;

    &::before {
      content: '▶';
      font-size: 0.45rem;
      transition: transform 0.15s;
    }

    &:hover {
      color: rgba(251, 251, 251, 0.5);
    }
  }

  &[open] summary::before {
    transform: rotate(90deg);
  }

  pre {
    margin-top: 0.5rem;
    font-family: 'Courier New', monospace;
    font-size: 0.6rem;
    color: rgba(251, 251, 251, 0.4);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(251, 251, 251, 0.06);
    border-radius: 3px;
    padding: 0.5rem 0.75rem;
    line-height: 1.8;
    white-space: pre;
    overflow-x: auto;
  }
`

export const StyledMetadataSection = styled.div`
  padding-top: 1.25rem;
  border-top: 1px solid rgba(251, 251, 251, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

export const StyledMetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media (width >= 600px) {
    grid-template-columns: 1fr 1fr;
  }
`

export const StyledFormActions = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(251, 251, 251, 0.08);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`

export const StyledError = styled.p`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.orange};
  margin: 0;
  width: 100%;
`

export const StyledToolbarRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
`

export const StyledTextareaWrapper = styled.div`
  position: relative;
  width: 100%;
`

export const StyledEditEmbedButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
})`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1;
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.25rem 0.6rem;
  background: rgba(58, 134, 255, 0.15);
  border-color: rgba(58, 134, 255, 0.4);
  color: ${({ theme }) => theme.colors.white};

  &:hover {
    background: rgba(58, 134, 255, 0.3);
    border-color: rgba(58, 134, 255, 0.7);
  }
`

export const StyledImagePickerButton = styled(Button).attrs({
  variant: 'contained',
  size: 'sm',
})`
  align-self: flex-start;
  border-color: rgba(251, 251, 251, 0.15);
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.3rem 0.75rem;
  opacity: 0.7;
  transition:
    opacity 0.15s,
    border-color 0.15s;

  &:hover {
    opacity: 1;
    border-color: ${({ theme }) => theme.colors.green};
  }
`
