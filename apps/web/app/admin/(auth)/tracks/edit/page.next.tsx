import { redirect } from 'next/navigation'

import { requireAdminSession } from '@web/lib/auth/requireAdminSession'

import { TrackEditorLoader } from '../components/TrackEditorLoader'

export const dynamic = 'force-dynamic'

interface AdminTrackEditPageProps {
  searchParams: Promise<{ path?: string }>
}

export default async function AdminTrackEditPage({
  searchParams,
}: AdminTrackEditPageProps) {
  await requireAdminSession()
  const { path } = await searchParams
  if (!path) redirect('/admin/tracks')
  return <TrackEditorLoader path={path} />
}
