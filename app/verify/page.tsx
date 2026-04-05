'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useDocuments } from '@/lib/documents-context'
import { useAuth } from '@/lib/auth-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  Hash,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react'
import { verifyDocument, formatHash, formatTxHash } from '@/lib/blockchain'
import type { VerificationResult } from '@/lib/types'

export default function VerifyPage() {
  const { documents, addActivity } = useDocuments()
  const { user } = useAuth()
  
  const [file, setFile] = useState<File | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setResult(null)
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleVerify = async () => {
    if (!file) return

    setIsVerifying(true)
    const verificationResult = await verifyDocument(file, documents)
    setResult(verificationResult)
    setIsVerifying(false)

    // Log the verification activity
    if (verificationResult.documentId && user) {
      addActivity({
        documentId: verificationResult.documentId,
        documentTitle: verificationResult.documentTitle || 'Unknown',
        action: 'verify',
        performedBy: user.name,
        performedAt: new Date(),
        details: verificationResult.isAuthentic
          ? 'Document verified as authentic'
          : 'Verification attempted - document not found',
      })
    }
  }

  const resetVerification = () => {
    setFile(null)
    setResult(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Verify Document</h1>
            <p className="mt-2 text-muted-foreground">
              Upload any document to instantly verify its authenticity against the blockchain
            </p>
          </div>

          {/* Result Display */}
          {result && (
            <Card
              className={`mb-8 border-2 ${
                result.isAuthentic
                  ? 'border-accent bg-accent/5'
                  : 'border-destructive bg-destructive/5'
              }`}
            >
              <CardContent className="py-8">
                <div className="text-center">
                  {result.isAuthentic ? (
                    <>
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
                        <CheckCircle className="h-10 w-10 text-accent" />
                      </div>
                      <h2 className="mb-2 text-2xl font-bold text-accent">
                        Document Verified
                      </h2>
                      <p className="mb-6 text-muted-foreground">{result.message}</p>

                      {/* Document Details */}
                      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-4 text-left">
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{result.documentTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              Owned by {result.ownerName}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-border pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge
                              className={`${
                                result.currentStatus === 'active'
                                  ? 'bg-accent/20 text-accent'
                                  : 'bg-destructive/20 text-destructive'
                              } border-0`}
                            >
                              {result.currentStatus === 'active' ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : (
                                <XCircle className="mr-1 h-3 w-3" />
                              )}
                              {result.currentStatus}
                            </Badge>
                          </div>

                          {result.blockchainRecord && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Block</span>
                                <span className="font-mono text-sm">
                                  #{result.blockchainRecord.blockNumber}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Timestamp</span>
                                <span className="text-sm">
                                  {new Date(result.blockchainRecord.timestamp).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-muted-foreground">Transaction</span>
                                <code className="mt-1 block break-all font-mono text-xs">
                                  {formatTxHash(result.blockchainRecord.transactionHash)}
                                </code>
                              </div>
                            </>
                          )}
                        </div>

                        {result.documentId && (
                          <Link href={`/document/${result.documentId}`}>
                            <Button className="mt-4 w-full" variant="outline">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Full Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
                        <XCircle className="h-10 w-10 text-destructive" />
                      </div>
                      <h2 className="mb-2 text-2xl font-bold text-destructive">
                        Verification Failed
                      </h2>
                      <p className="mb-6 max-w-md mx-auto text-muted-foreground">{result.message}</p>

                      <div className="mx-auto max-w-md rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-destructive">Warning:</strong> This document could not be
                          verified. It may have been tampered with, modified, or was never registered on
                          the blockchain.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button onClick={resetVerification} variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Verify Another Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Area */}
          {!result && (
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Upload Document to Verify</CardTitle>
                <CardDescription>
                  Drop your document here and we will check it against our blockchain records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : file
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {file ? (
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
                        <FileText className="h-7 w-7 text-primary" />
                      </div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      <Button
                        onClick={handleVerify}
                        className="mt-6"
                        size="lg"
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Shield className="mr-2 h-5 w-5" />
                            Verify Document
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-2 text-center text-lg font-medium">
                        Drag and drop your document here
                      </p>
                      <p className="mb-4 text-center text-muted-foreground">
                        or click to browse your files
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <p className="text-sm text-muted-foreground">
                        Supported: PDF, DOC, DOCX, JPG, PNG
                      </p>
                    </>
                  )}
                </div>

                {/* How it works */}
                <div className="mt-8">
                  <h3 className="mb-4 font-medium">How verification works</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                        1
                      </div>
                      <div>
                        <p className="text-sm font-medium">Generate Hash</p>
                        <p className="text-xs text-muted-foreground">
                          We create a unique fingerprint of your document
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                        2
                      </div>
                      <div>
                        <p className="text-sm font-medium">Check Blockchain</p>
                        <p className="text-xs text-muted-foreground">
                          Compare against all registered records
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                        3
                      </div>
                      <div>
                        <p className="text-sm font-medium">Get Result</p>
                        <p className="text-xs text-muted-foreground">
                          Instant verification with full details
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card className="border-border bg-card">
              <CardContent className="flex items-start gap-3 py-4">
                <Hash className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Cryptographic Security</p>
                  <p className="text-xs text-muted-foreground">
                    Even a single character change creates a completely different hash
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardContent className="flex items-start gap-3 py-4">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-medium">Instant Verification</p>
                  <p className="text-xs text-muted-foreground">
                    Results in seconds, not days or weeks like traditional methods
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
