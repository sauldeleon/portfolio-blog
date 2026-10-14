import styled from 'styled-components'

export const StyledPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.75rem;
`

export const StyledHelp = styled.p`
  margin: 0;
  font-size: 0.65rem;
  line-height: 1.6;
  opacity: 0.55;
`

export const StyledEmpty = styled.p`
  margin: 0;
  opacity: 0.4;
  text-align: center;
  padding: 1rem 0;
`

export const StyledList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const StyledItem = styled.li<{
  $selected: boolean
  $dropTarget: boolean
}>`
  border: 1px solid
    ${({ $selected }) =>
      $selected ? 'rgba(251, 251, 251, 0.35)' : 'rgba(251, 251, 251, 0.08)'};
  box-shadow: ${({ $dropTarget, theme }) =>
    $dropTarget ? `inset 0 2px 0 ${theme.colors.green}` : 'none'};
`

export const StyledItemRow = styled.div`
  display: flex;
  align-items: center;
  padding-right: 0.25rem;
`

export const StyledDragHandle = styled.span`
  padding: 0.5rem 0 0.5rem 0.5rem;
  font-size: 0.7rem;
  letter-spacing: -0.2em;
  opacity: 0.4;
  cursor: grab;
  user-select: none;

  &:hover {
    opacity: 1;
  }
`

export const StyledMoveIcon = styled.span<{ $direction: 'up' | 'down' }>`
  display: inline-flex;
  transform: rotate(
    ${({ $direction }) => ($direction === 'up' ? '-90deg' : '90deg')}
  );
`

export const StyledItemHeader = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  font-size: 0.75rem;
  padding: 0.5rem 0.6rem;
  cursor: pointer;
  text-align: left;
`

export const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 0.6rem 0.75rem;

  > button:last-child {
    align-self: flex-end;
    text-transform: uppercase;
  }
`

export const StyledField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.65rem;

  > span {
    opacity: 0.6;
  }

  input,
  textarea {
    font-size: 0.75rem;
  }
`

export const StyledSymbols = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`
