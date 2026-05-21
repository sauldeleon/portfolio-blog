import styled from 'styled-components'

export const StyledPage = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  /* overflow-x: auto; */
`

export const StyledSkipLink = styled.a`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9999;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  transform: translateY(-100%);
  transition: transform 0.15s;

  &:focus {
    transform: translateY(0%);
  }
`

export const StyledContent = styled.main`
  display: flex;
  min-height: calc(100vh - 115px - 300px);
  align-items: center;
  flex-direction: column;

  ${({ theme }) => theme.media.up.md} {
    min-height: calc(100vh - 115px - 210px);
  }

  ${({ theme }) => theme.media.up.lg} {
    min-height: calc(100vh - 115px - 185px);
  }
`
