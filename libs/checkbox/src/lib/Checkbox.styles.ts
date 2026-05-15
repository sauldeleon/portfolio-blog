import styled from 'styled-components'

export const StyledWrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  &:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.4;
  }
`

export const StyledNativeInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

export const StyledBox = styled.span<{ $checked: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.875rem;
  height: 0.875rem;
  border: 1px solid
    ${({ $checked, theme }) =>
      $checked ? theme.colors.green : 'rgba(251, 251, 251, 0.3)'};
  background: ${({ $checked, theme }) =>
    $checked ? theme.colors.green : 'transparent'};
  flex-shrink: 0;
  transition:
    border-color 0.15s,
    background 0.15s;

  &::after {
    content: '';
    display: ${({ $checked }) => ($checked ? 'block' : 'none')};
    width: 0.3rem;
    height: 0.175rem;
    border-left: 1.5px solid ${({ theme }) => theme.colors.black};
    border-bottom: 1.5px solid ${({ theme }) => theme.colors.black};
    transform: rotate(-45deg) translateY(-0.05rem);
  }
`

export const StyledLabel = styled.span`
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.colors.white};
  opacity: 0.5;
  user-select: none;
`
