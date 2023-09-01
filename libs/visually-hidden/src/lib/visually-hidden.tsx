import styled from 'styled-components'

export const VisuallyHidden = styled.span`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  left: 0;
  top: 0;
  white-space: nowrap;
  width: 1px;
  inset: 0;
`
