import Link from 'next/link'
import styled from 'styled-components'

export const StyledCard = styled.article`
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(251, 251, 251, 0.1);
  overflow: hidden;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.green};
  }
`

export const StyledCover = styled.div`
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #0d0d0d;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
    display: block;
  }

  ${StyledCard}:hover & img {
    transform: scale(1.05);
  }
`

export const StyledPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%);
`

export const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem 1.25rem;
  flex: 1;
`

export const StyledCategory = styled.span`
  ${({ theme }) => theme.typography.label.XS}
  color: ${({ theme }) => theme.colors.green};
`

export const StyledTitle = styled.h2`
  ${({ theme }) => theme.typography.body.L}
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const StyledExcerpt = styled.p`
  ${({ theme }) => theme.typography.body.S}
  margin: 0;
  opacity: 0.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`

export const StyledMeta = styled.div`
  ${({ theme }) => theme.typography.body.XS}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem 0.75rem;
  opacity: 0.45;
  margin-top: 0.25rem;
`

export const StyledTagList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  list-style: none;
  margin: 0;
  padding: 0;
`

export const StyledTag = styled.li`
  ${({ theme }) => theme.typography.body.XS}
  padding: 0.125rem 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.green};
`

export const StyledMoreTags = styled.span`
  ${({ theme }) => theme.typography.body.XS}
  opacity: 0.5;
`

export const StyledReadMore = styled(Link)`
  ${({ theme }) => theme.typography.body.XS}
  color: ${({ theme }) => theme.colors.yellow};
  text-decoration: none;
  display: inline-block;
  align-self: flex-start;
  margin-top: 0.75rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 1px;
    bottom: 0;
    left: 0;
    background-color: currentColor;
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform 0.2s ease-out;
  }

  &:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }
`
