import { requireAdminSession } from '@web/lib/auth/requireAdminSession'

import { ImageManager } from './components/ImageManager'

export const dynamic = 'force-dynamic'

export default async function AdminImagesPage() {
  await requireAdminSession()
  return <ImageManager />
}
