import styled from 'styled-components'

export const StyledCard = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const StyledCover = styled.div`
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background-color: #333;
`

export const StyledPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: #444;
`

export const StyledCategory = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

export const StyledTitle = styled.h2`
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const StyledExcerpt = styled.p`
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const StyledMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.875rem;
`

export const StyledTagList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
`

export const StyledTag = styled.li`
  font-size: 0.75rem;
`

export const StyledMoreTags = styled.span`
  font-size: 0.75rem;
`

export const StyledReadMore = styled.div`
  margin-top: auto;
`
