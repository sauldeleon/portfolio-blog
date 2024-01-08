import styled from 'styled-components'

export const StyledPage = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  /* overflow-x: auto; */
`

export const StyledContent = styled.div`
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
