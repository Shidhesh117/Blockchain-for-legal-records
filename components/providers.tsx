'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { DocumentsProvider } from '@/lib/documents-context'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DocumentsProvider>{children}</DocumentsProvider>
    </AuthProvider>
  )
}
