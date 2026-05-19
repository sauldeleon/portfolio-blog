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

export const StyledCategory = styled.span`
  display: inline-block;
  color: ${({ theme }) => theme.colors.green};
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
`

export const StyledTagList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 1rem;
`

export const StyledTag = styled.li`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.6rem;
  border: 1px solid rgba(152, 223, 214, 0.3);
  color: rgba(152, 223, 214, 0.7);
  border-radius: 2px;
`

export const StyledSeriesBadge = styled.div`
  display: flex;
  width: fit-content;
  align-items: center;
  gap: 0.5rem;
  margin: 0.4rem 0 0.75rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.yellow};
  border: 1px solid ${({ theme }) => theme.colors.yellow};
  border-radius: 2px;
  padding: 0.2rem 0.6rem;
  opacity: 0.75;
`

export const StyledMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  opacity: 0.7;
  margin-top: 0.75rem;
`

export const StyledMetaSep = styled.span`
  opacity: 0.35;
  user-select: none;
`
