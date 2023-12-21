import styled from 'styled-components'

export const StyledTextButton = styled.button`
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
  ${({ theme }) => theme.helpers.focusVisible};
`

export const StyledContainedButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.white};
  padding: 15px 20px;
`
