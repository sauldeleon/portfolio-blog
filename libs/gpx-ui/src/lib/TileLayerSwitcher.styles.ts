import styled from 'styled-components'

export const StyledLayerSwitcher = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 1000;
  display: flex;
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
`

export const StyledLayerButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)'};
  border: none;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
  padding: 0.28rem 0.6rem;
  font-size: 0.68rem;
  font-weight: ${({ $active }) => ($active ? '700' : '500')};
  color: ${({ $active }) => ($active ? '#111' : '#555')};
  line-height: 1;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    color: #111;
  }
`
