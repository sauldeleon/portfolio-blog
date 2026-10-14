import { requireAdminSession } from '@web/lib/auth/requireAdminSession'

import { TrackList } from './components/TrackList'

export const dynamic = 'force-dynamic'

export default async function AdminTracksPage() {
  await requireAdminSession()
  return <TrackList />
}
