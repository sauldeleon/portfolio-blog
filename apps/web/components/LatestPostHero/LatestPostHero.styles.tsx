import Link from 'next/link'
import styled from 'styled-components'

export const StyledWrapper = styled.article`
  color: ${({ theme }) => theme.colors.white};
`

export const StyledCoverWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 7;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    aspect-ratio: 4 / 3;
  }
`

export const StyledContent = styled.div`
  padding: 1.5rem 0;

  @media (width >= 768px) {
    padding: 2rem 0;
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

export const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 1rem;
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

export const StyledTitle = styled.h2`
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

export const StyledExcerpt = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.8;
  margin: 1rem 0;
`

export const StyledMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  color: ${({ theme }) => theme.colors.white};
  font-size: 0.875rem;
  opacity: 0.7;
  margin-bottom: 1.5rem;
`

export const StyledMetaSep = styled.span`
  opacity: 0.35;
  user-select: none;
`

export const StyledReadMoreLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid ${({ theme }) => theme.colors.yellow};
  color: ${({ theme }) => theme.colors.yellow};
  padding: 10px 15px;
  text-decoration: none;
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.yellow};
    color: ${({ theme }) => theme.colors.black};
  }
`
