import styled from 'styled-components'

export const StyledHeader = styled.header`
  color: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid rgba(152, 223, 214, 0.2);
`

export const StyledHeroContent = styled.div`
  padding: 1.5rem 0;

  @media (width >= 768px) {
    padding: 2rem 0;
  }
`

export const StyledPostTitle = styled.h1`
  font-size: 1.5rem;
  line-height: 1.25;
  margin: 0.5rem 0 0;

  @media (width >= 768px) {
    font-size: 2rem;
  }

  @media (width >= 1024px) {
    font-size: 2.5rem;
  }
`

export const StyledCoverWrapper = styled.div<{ $fit: 'cover' | 'contain' }>`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    aspect-ratio: 4 / 3;
  }
`

export const StyledCategoryBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.green};
  border: 1px solid ${({ theme }) => theme.colors.green};
  border-radius: 2px;
  padding: 0.2rem 0.6rem;
  opacity: 0.75;

  svg {
    width: 0.75rem;
    height: 0.75rem;
    flex-shrink: 0;
  }
`

export const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
`

export const StyledSeriesBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.yellow};
  border: 1px solid ${({ theme }) => theme.colors.yellow};
  border-radius: 2px;
  padding: 0.2rem 0.6rem;
  opacity: 0.75;
`

export const StyledTag = styled.span`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.6rem;
  border: 1px solid rgba(152, 223, 214, 0.3);
  color: rgba(152, 223, 214, 0.7);
  border-radius: 2px;
`

export const StyledMetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
`

export const StyledMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  opacity: 0.7;
`

export const StyledMetaActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

export const StyledMetaSep = styled.span`
  opacity: 0.35;
  user-select: none;
`
