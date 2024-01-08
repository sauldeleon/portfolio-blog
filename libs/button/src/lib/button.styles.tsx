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
