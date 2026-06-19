import styled from 'styled-components'

export const StyledSentinel = styled.div`
  height: 0;
  overflow: hidden;
`

export const StyledBar = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9000;
  height: 48px;
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid rgba(152, 223, 214, 0.2);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition:
    opacity 0.2s ease,
    visibility 0s ${({ $visible }) => ($visible ? '0s' : '0.2s')};

  @media (width >= 768px) {
    height: 56px;
  }
`

export const StyledBarInner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (width >= 1024px) {
    padding: 0 2rem;
  }
`

export const StyledTitle = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  opacity: 0.8;
  display: none;

  @media (width >= 480px) {
    display: block;
  }
`

export const StyledShareSection = styled.div`
  display: flex;
  align-items: center;
`

export const StyledNavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: auto;
`

export const StyledActionsDivider = styled.span`
  display: block;
  width: 1px;
  height: 1rem;
  background: rgba(152, 223, 214, 0.25);
  flex-shrink: 0;
`

export const StyledScrollTopButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  padding: 0;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
  }
`

export const StyledLangButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  height: 1.5rem;
  padding: 0 0.4rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`
