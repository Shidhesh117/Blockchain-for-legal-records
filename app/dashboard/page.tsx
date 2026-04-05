'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useDocuments } from '@/lib/documents-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Upload,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  Activity,
  TrendingUp,
} from 'lucide-react'
import type { LegalDocument, DocumentStatus } from '@/lib/types'

const STATUS_CONFIG: Record<DocumentStatus, { icon: typeof CheckCircle; color: string; label: string }> = {
  active: { icon: CheckCircle, color: 'text-accent', label: 'Active' },
  revoked: { icon: XCircle, color: 'text-destructive', label: 'Revoked' },
  pending: { icon: Clock, color: 'text-warning', label: 'Pending' },
}

const TYPE_LABELS: Record<string, string> = {
  property: 'Property',
  affidavit: 'Affidavit',
  court_order: 'Court Order',
  identity: 'Identity',
  contract: 'Contract',
  other: 'Other',
}

function DocumentCard({ doc }: { doc: LegalDocument }) {
  const config = STATUS_CONFIG[doc.status]
  const StatusIcon = config.icon

  return (
    <Link href={`/document/${doc.id}`}>
      <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary/50 hover:bg-card/80">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/20">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-medium group-hover:text-primary">
                {doc.title}
              </h3>
              <StatusIcon className={`h-4 w-4 shrink-0 ${config.color}`} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {TYPE_LABELS[doc.type]}
              </Badge>
              <span>v{doc.currentVersion}</span>
              <span className="hidden sm:inline">
                {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        </CardContent>
      </Card>
    </Link>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { getUserDocuments, activities } = useDocuments()

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const userDocs = getUserDocuments(user.id)
  const activeCount = userDocs.filter((d) => d.status === 'active').length
  const recentActivities = activities.slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user.name.split(' ')[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage and verify your legal documents securely
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userDocs.length}</p>
                <p className="text-sm text-muted-foreground">Total Documents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground">Active Documents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {userDocs.reduce((acc, d) => acc + d.versions.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Blockchain Records</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{user.role}</p>
                <p className="text-sm text-muted-foreground">Account Type</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Link href="/upload">
            <Card className="group cursor-pointer border-border bg-card transition-all hover:border-primary hover:bg-primary/5">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Upload className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-primary">Upload Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Register a new legal document on blockchain
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/verify">
            <Card className="group cursor-pointer border-border bg-card transition-all hover:border-accent hover:bg-accent/5">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Shield className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-accent">Verify Document</h3>
                  <p className="text-sm text-muted-foreground">
                    Check authenticity against blockchain
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Documents List */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Documents</CardTitle>
                  <CardDescription>
                    All documents you own or have access to
                  </CardDescription>
                </div>
                <Link href="/upload">
                  <Button size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {userDocs.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {userDocs.map((doc) => (
                      <DocumentCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 font-medium">No documents yet</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Upload your first document to get started
                    </p>
                    <Link href="/upload">
                      <Button>Upload Document</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivities.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="border-l-2 border-border pl-4"
                      >
                        <p className="text-sm font-medium">{activity.documentTitle}</p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {activity.action.replace('_', ' ')} by {activity.performedBy}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.performedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
