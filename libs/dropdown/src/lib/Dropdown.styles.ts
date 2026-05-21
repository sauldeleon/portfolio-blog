import styled from 'styled-components'

export const StyledDropdownPanel = styled.div`
  position: absolute;
  left: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.black};
  border: 1px solid rgba(251, 251, 251, 0.12);
`
