'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

export function AdminNav() {
  return (
    <nav data-testid="admin-nav">
      <Link href="/admin/posts">Posts</Link>
      <Link href="/admin/categories">Categories</Link>
      <button onClick={() => signOut({ callbackUrl: '/admin/login' })}>
        Logout
      </button>
    </nav>
  )
}
