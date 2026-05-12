'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { AdminPost } from '@web/lib/db/queries/posts'

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'

const STATUS_FILTERS: StatusFilter[] = ['all', 'published', 'draft', 'archived']

interface PostTableProps {
  posts: AdminPost[]
}

export function PostTable({ posts }: PostTableProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const router = useRouter()

  const filtered = posts.filter((p) => {
    const matchesStatus = filter === 'all' || p.status === filter
    const searchLower = search.toLowerCase()
    const title = p.titleEn ?? p.titleEs ?? ''
    const matchesSearch = title.toLowerCase().includes(searchLower)
    return matchesStatus && matchesSearch
  })

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this post?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function handleTogglePublish(post: AdminPost) {
    const isPublished = post.status === 'published'
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        isPublished
          ? { status: 'draft', publishedAt: null }
          : { status: 'published', publishedAt: new Date().toISOString() },
      ),
    })
    router.refresh()
  }

  const canPublish = (post: AdminPost) => !!(post.titleEn && post.titleEs)

  return (
    <div data-testid="post-table">
      <div data-testid="filter-tabs">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            aria-pressed={filter === s}
            data-testid={`filter-${s}`}
          >
            {s}
          </button>
        ))}
      </div>
      <input
        type="search"
        placeholder="Search posts…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        data-testid="search-input"
      />
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Category</th>
            <th>Translations</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((post) => (
            <tr key={post.id} data-testid="post-row">
              <td>{post.titleEn ?? post.titleEs ?? '—'}</td>
              <td>{post.status}</td>
              <td>{post.category}</td>
              <td>
                EN {post.titleEn ? '✓' : '✗'} / ES {post.titleEs ? '✓' : '✗'}
              </td>
              <td>
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString()
                  : '—'}
              </td>
              <td>
                <a href={`/admin/posts/${post.id}`} data-testid="edit-link">
                  Edit
                </a>
                <button
                  onClick={() => handleTogglePublish(post)}
                  disabled={post.status !== 'published' && !canPublish(post)}
                  data-testid="publish-button"
                >
                  {post.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  data-testid="delete-button"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
