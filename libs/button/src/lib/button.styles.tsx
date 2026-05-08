import styled, { css } from 'styled-components'

const sharedButtonStyles = css`
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  cursor: pointer;
`

export const StyledTextButton = styled.button`
  ${sharedButtonStyles}
  padding: 0;
  outline: none;
  box-shadow: none;
  padding-block: 0;
  padding-inline: 0;
  border: none;
  color: ${({ theme }) => theme.colors.white};

  ${({ theme }) => theme.helpers.textBottomBorder.afterShared};
  ${({ theme }) => theme.helpers.textBottomBorder.transform()};
  ${({ theme }) => theme.helpers.focusVisible};
`

export const StyledContainedButton = styled.button`
  ${sharedButtonStyles}
  border: 1px solid ${({ theme }) => theme.colors.white};
  padding: 15px 20px;
`

export const StyledInvertedButton = styled.button`
  ${sharedButtonStyles}
  border: 1px solid ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  padding: 15px 20px;

  &:hover {
    background-color: transparent;
    color: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`
