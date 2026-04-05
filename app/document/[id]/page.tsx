'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useDocuments } from '@/lib/documents-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Hash,
  ExternalLink,
  Upload,
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  History,
} from 'lucide-react'
import type { DocumentStatus } from '@/lib/types'
import { formatHash, formatTxHash, generateHash } from '@/lib/blockchain'

const STATUS_CONFIG: Record<DocumentStatus, { icon: typeof CheckCircle; color: string; bgColor: string; label: string }> = {
  active: { icon: CheckCircle, color: 'text-accent', bgColor: 'bg-accent/20', label: 'Active' },
  revoked: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/20', label: 'Revoked' },
  pending: { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/20', label: 'Pending' },
}

const TYPE_LABELS: Record<string, string> = {
  property: 'Property Document',
  affidavit: 'Affidavit',
  court_order: 'Court Order',
  identity: 'Identity Proof',
  contract: 'Contract',
  other: 'Other',
}

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { getDocument, uploadNewVersion, revokeDocument, getDocumentActivities } = useDocuments()
  
  const [copied, setCopied] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null)
  const [newVersionNotes, setNewVersionNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)

  const doc = getDocument(id)
  const activities = doc ? getDocumentActivities(doc.id) : []

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleNewVersion = async () => {
    if (!newVersionFile || !user || !doc) return
    
    setIsUploading(true)
    await uploadNewVersion(doc.id, newVersionFile, newVersionNotes, user.id)
    setIsUploading(false)
    setIsUploadDialogOpen(false)
    setNewVersionFile(null)
    setNewVersionNotes('')
  }

  const handleRevoke = async () => {
    if (!user || !doc) return
    
    setIsRevoking(true)
    await revokeDocument(doc.id, user.id)
    setIsRevoking(false)
    setIsRevokeDialogOpen(false)
  }

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

  if (!doc) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card className="mx-auto max-w-lg border-border bg-card text-center">
            <CardContent className="py-12">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-bold">Document Not Found</h2>
              <p className="mb-4 text-muted-foreground">
                The document you are looking for does not exist or you do not have access.
              </p>
              <Link href="/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const config = STATUS_CONFIG[doc.status]
  const StatusIcon = config.icon
  const isOwner = doc.ownerId === user.id
  const currentVersion = doc.versions.find((v) => v.status === 'active') || doc.versions[doc.versions.length - 1]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Document Header */}
            <Card className="mb-6 border-border bg-card">
              <CardContent className="py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{doc.title}</h1>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{TYPE_LABELS[doc.type]}</Badge>
                        <Badge className={`${config.bgColor} ${config.color} border-0`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {config.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Version {doc.currentVersion}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isOwner && doc.status === 'active' && (
                    <div className="flex gap-2">
                      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            New Version
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Upload New Version</DialogTitle>
                            <DialogDescription>
                              Upload a corrected version of this document. The previous version will be marked as revoked.
                            </DialogDescription>
                          </DialogHeader>
                          <FieldGroup className="mt-4">
                            <Field>
                              <FieldLabel>New Document File</FieldLabel>
                              <Input
                                type="file"
                                onChange={(e) => setNewVersionFile(e.target.files?.[0] || null)}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                            </Field>
                            <Field>
                              <FieldLabel>Version Notes</FieldLabel>
                              <Textarea
                                placeholder="Describe the changes in this version..."
                                value={newVersionNotes}
                                onChange={(e) => setNewVersionNotes(e.target.value)}
                                rows={3}
                              />
                            </Field>
                            <Button
                              onClick={handleNewVersion}
                              disabled={!newVersionFile || isUploading}
                              className="w-full"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                'Upload New Version'
                              )}
                            </Button>
                          </FieldGroup>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isRevokeDialogOpen} onOpenChange={setIsRevokeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                            Revoke
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                              <AlertTriangle className="h-5 w-5" />
                              Revoke Document
                            </DialogTitle>
                            <DialogDescription>
                              Are you sure you want to revoke this document? This action cannot be undone. The document will be marked as invalid.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsRevokeDialogOpen(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleRevoke}
                              disabled={isRevoking}
                              className="flex-1"
                            >
                              {isRevoking ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Revoking...
                                </>
                              ) : (
                                'Revoke Document'
                              )}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>

                {doc.description && (
                  <p className="mt-4 text-muted-foreground">{doc.description}</p>
                )}

                <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Owner:</span>{' '}
                    <span className="font-medium">{doc.ownerName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">File:</span>{' '}
                    <span className="font-medium">{doc.fileName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>{' '}
                    <span className="font-medium">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Updated:</span>{' '}
                    <span className="font-medium">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blockchain Record */}
            <Card className="mb-6 border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Blockchain Record
                </CardTitle>
                <CardDescription>
                  Immutable proof of document authenticity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Hash className="h-4 w-4" />
                        Document Hash
                      </span>
                      <button
                        onClick={() => copyToClipboard(currentVersion.hash, 'hash')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copied === 'hash' ? (
                          <Check className="h-4 w-4 text-accent" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <code className="block break-all font-mono text-xs">
                      {currentVersion.hash}
                    </code>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <span className="text-sm text-muted-foreground">Transaction Hash</span>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="font-mono text-xs">
                          {formatTxHash(currentVersion.blockchainRecord.transactionHash)}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(currentVersion.blockchainRecord.transactionHash, 'tx')
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copied === 'tx' ? (
                            <Check className="h-3 w-3 text-accent" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-secondary/30 p-4">
                      <span className="text-sm text-muted-foreground">Block Number</span>
                      <p className="mt-1 font-mono text-sm font-medium">
                        #{currentVersion.blockchainRecord.blockNumber}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/30 p-4">
                    <span className="text-sm text-muted-foreground">Timestamp</span>
                    <p className="mt-1 text-sm font-medium">
                      {new Date(currentVersion.blockchainRecord.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Version History */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Version History
                </CardTitle>
                <CardDescription>
                  Complete audit trail of all document versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {doc.versions
                    .slice()
                    .reverse()
                    .map((version, index) => {
                      const vConfig = STATUS_CONFIG[version.status]
                      const VIcon = vConfig.icon
                      const isLatest = index === 0

                      return (
                        <div
                          key={version.version}
                          className={`relative flex gap-4 pb-6 ${
                            index !== doc.versions.length - 1 ? 'border-l-2 border-border ml-3 pl-6' : 'ml-3 pl-6'
                          }`}
                        >
                          <div
                            className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${vConfig.bgColor}`}
                          >
                            <VIcon className={`h-3 w-3 ${vConfig.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Version {version.version}</span>
                              {isLatest && (
                                <Badge variant="outline" className="text-xs">
                                  Current
                                </Badge>
                              )}
                              <Badge className={`${vConfig.bgColor} ${vConfig.color} border-0 text-xs`}>
                                {vConfig.label}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {new Date(version.uploadedAt).toLocaleString()}
                            </p>
                            {version.notes && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {version.notes}
                              </p>
                            )}
                            <code className="mt-2 block text-xs text-muted-foreground">
                              Hash: {formatHash(version.hash, 12)}
                            </code>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            {/* Activity Log */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="border-l-2 border-border pl-4"
                      >
                        <p className="text-sm font-medium capitalize">
                          {activity.action.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          by {activity.performedBy}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.performedAt).toLocaleString()}
                        </p>
                        {activity.details && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {activity.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">
                    No activity recorded
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
