import styled, { css } from 'styled-components'

const sharedButtonStyles = css`
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  cursor: pointer;
`

type ButtonSize = 'sm' | 'md' | 'lg'

const buttonSizeStyles: Record<ButtonSize, ReturnType<typeof css>> = {
  sm: css`
    padding: 0.5rem 1rem;
    font-size: 0.6rem;
  `,
  md: css`
    padding: 15px 20px;
  `,
  lg: css`
    padding: 1.25rem 2rem;
    font-size: 1rem;
  `,
}

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

export const StyledContainedButton = styled.button<{ $size: ButtonSize }>`
  ${sharedButtonStyles}
  border: 1px solid ${({ theme }) => theme.colors.white};
  ${({ $size }) => buttonSizeStyles[$size]}
`

export const StyledInvertedButton = styled.button<{ $size: ButtonSize }>`
  ${sharedButtonStyles}
  border: 1px solid ${({ theme }) => theme.colors.white};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  ${({ $size }) => buttonSizeStyles[$size]}

  &:hover:not(:disabled) {
    background-color: transparent;
    color: ${({ theme }) => theme.colors.white};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const buttonLabelStyles = css<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  flex: 0 0 auto;
  min-height: 1.75rem;
  background: transparent;
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.green : 'transparent')};
  padding: 0.375rem 0.75rem;
  font-family: inherit;
  font-size: 0.65rem;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  color: ${({ $active, theme }) =>
    $active ? theme.colors.green : theme.colors.white};
  opacity: ${({ $active }) => ($active ? 1 : 0.45)};
  white-space: nowrap;
  transition:
    opacity 0.15s,
    border-color 0.15s,
    color 0.15s,
    background 0.15s;

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.green};
    border-color: rgba(152, 223, 214, 0.45);
  }

  &:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  ${({ theme }) => theme.helpers.focusVisible};
`

export const StyledLabelButton = styled.button<{ $active: boolean }>`
  ${buttonLabelStyles}
`
