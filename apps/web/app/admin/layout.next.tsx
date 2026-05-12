import { AdminNav } from './AdminNav'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <html lang="en">
      <body>
        <div data-testid="admin-layout">
          <AdminNav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
