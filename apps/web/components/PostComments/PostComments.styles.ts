import styled from 'styled-components'

export const StyledSection = styled.section`
  max-width: 800px;
  margin: 4rem auto 0;
  padding: 0 1.5rem;
`

export const StyledTitle = styled.h2`
  ${({ theme }) => theme.typography.heading.heading2}
  margin: 0 0 2rem;
  font-size: 1.2rem;
`

export const StyledCommentList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const StyledCommentItem = styled.li<{
  $isReply?: boolean
  $highlighted?: boolean
}>`
  border-left: 2px solid
    ${({ $isReply, $highlighted, theme }) =>
      $highlighted
        ? theme.colors.green
        : $isReply
          ? `${theme.colors.green}40`
          : 'rgba(251,251,251,0.08)'};
  padding-left: ${({ $isReply }) => ($isReply ? '1.25rem' : '1rem')};
  margin-left: ${({ $isReply }) => ($isReply ? '1.5rem' : '0')};
  background-color: ${({ $highlighted, theme }) =>
    $highlighted ? `${theme.colors.green}0c` : 'transparent'};
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease;
`

export const StyledCommentMeta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.375rem;
`

export const StyledUsername = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.green};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`

export const StyledDate = styled.time`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.35;
`

export const StyledBody = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.85;
  line-height: 1.6;
  margin: 0 0 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
`

export const StyledReplyButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.35;
  padding: 0;

  &:hover {
    opacity: 0.7;
    color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledEmpty = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  padding: 1rem 0;
`

export const StyledError = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.orange};
  opacity: 0.7;
  padding: 1rem 0;
`

export const StyledDisabled = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.3;
  padding: 1rem 0;
  font-style: italic;
`

export const StyledReplyingTo = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.green};
  opacity: 0.6;
  margin-bottom: 0.25rem;
`

export const StyledFormSection = styled.div`
  margin-top: 0;
`

export const StyledFormTitle = styled.h3`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.4;
  margin: 0 0 1rem;
  font-weight: 400;
`

export const StyledDivider = styled.hr`
  border: none;
  border-top: 1px solid rgba(251, 251, 251, 0.06);
  margin: 2rem 0;
`
