import styled from 'styled-components'

export const StyledPage = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  overflow-x: scroll;
`

export const StyledContent = styled.div`
  display: flex;
  min-height: calc(100vh - 115px - 300px);
  padding-top: 80px;
  align-items: center;
  flex-direction: column;
  overflow: hidden;

  ${({ theme }) => theme.media.up.md} {
    min-height: calc(100vh - 115px - 210px);
  }

  ${({ theme }) => theme.media.up.lg} {
    min-height: calc(100vh - 115px - 185px);
  }
`
