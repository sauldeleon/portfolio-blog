export type PublicPostResponse = {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags: string[]
  author: string
  coverImage: string | null
  publishedAt: string | null
  updatedAt: string
  seriesId: string | null
  seriesOrder: number | null
  readingTime: number
}

export type PublicPostDetailResponse = PublicPostResponse & {
  content: string
}

export type PaginatedPostsResponse = {
  data: PublicPostResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CategoriesResponse = {
  data: Array<{ slug: string; name: string; description: string | null }>
}

export type TagsResponse = {
  data: Array<{ tag: string; count: number }>
}
