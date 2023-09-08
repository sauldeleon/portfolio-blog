import styled from 'styled-components'

export const StyledButton = styled.button`
  padding: 0;
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  outline: none;
  box-shadow: none;
  color: ${({ theme }) => theme.colors.white};
  padding-block: 0;
  padding-inline: 0;
  border: none;
  cursor: pointer;

  ${({ theme }) => theme.helpers.textBottomBorder.afterShared};
  ${({ theme }) => theme.helpers.textBottomBorder.transform()};

  &:focus-visible,
  &:focus {
    outline: ${({ theme }) => theme.colors.white} auto 1px;
  }
`
