import styled, { css } from 'styled-components'

import { Button } from '@sdlgr/button'

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

const actionButtonBase = css`
  background: transparent;
  border: 1px solid transparent;
  padding: 0.375rem 0.875rem;
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s,
    opacity 0.15s;

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }
`

export const StyledSaveButton = styled(Button).attrs({ variant: 'inverted' })`
  padding: 0.375rem 0.875rem;
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledPublishButton = styled.button<{ $published: boolean }>`
  ${actionButtonBase}
  color: ${({ $published, theme }) =>
    $published ? theme.colors.white : theme.colors.green};
  border-color: ${({ $published, theme }) =>
    $published ? 'rgba(251,251,251,0.3)' : theme.colors.green};

  &:hover:not(:disabled) {
    opacity: 0.8;
  }
`

export const StyledArchiveButton = styled.button`
  ${actionButtonBase}
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.45;
  border-color: rgba(251, 251, 251, 0.2);

  &:hover:not(:disabled) {
    opacity: 0.8;
  }
`

export const StyledLocaleTabs = styled.div`
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(251, 251, 251, 0.08);
  margin-bottom: 1.5rem;
`

export const StyledLocaleTab = styled.button<{ $active: boolean }>`
  background: transparent;
  border: none;
  border-bottom: 2px solid
    ${({ $active, theme }) => ($active ? theme.colors.green : 'transparent')};
  padding: 0.5rem 1rem;
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.green : theme.colors.white};
  opacity: ${({ $active }) => ($active ? 1 : 0.4)};
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s,
    opacity 0.15s;
  margin-bottom: -1px;

  &:hover {
    opacity: 1;
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
  gap: 0.5rem;
  min-height: 300px;
  border: 1px solid rgba(251, 251, 251, 0.06);
  border-radius: 2px;
  padding: 1rem;
  overflow-y: auto;
`

export const StyledPreviewLabel = styled.span`
  font-size: 0.55rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  opacity: 0.3;
  margin-bottom: 0.5rem;
`

export const StyledFieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const StyledLabel = styled.label`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
`

export const StyledInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(251, 251, 251, 0.2);
  padding: 0.5rem 0;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
  }

  &:focus {
    border-bottom-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledTextarea = styled.textarea`
  background: transparent;
  border: 1px solid rgba(251, 251, 251, 0.2);
  border-radius: 2px;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.white};
  font-family: inherit;
  font-size: 0.8rem;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
  line-height: 1.6;

  &::placeholder {
    color: ${({ theme }) => theme.colors.white};
    opacity: 0.25;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledContentTextarea = styled(StyledTextarea)`
  min-height: 400px;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
`

export const StyledHelper = styled.p`
  font-size: 0.65rem;
  opacity: 0.35;
  margin: 0;
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
