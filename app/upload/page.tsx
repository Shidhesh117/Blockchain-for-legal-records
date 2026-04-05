'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useDocuments } from '@/lib/documents-context'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  X,
  Shield,
  Hash,
  Link2,
} from 'lucide-react'
import type { DocumentType } from '@/lib/types'
import { generateHash, formatHash } from '@/lib/blockchain'

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'property', label: 'Property Document' },
  { value: 'affidavit', label: 'Affidavit' },
  { value: 'court_order', label: 'Court Order' },
  { value: 'identity', label: 'Identity Proof' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
]

export default function UploadPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { uploadDocument } = useDocuments()
  
  const [file, setFile] = useState<File | null>(null)
  const [fileHash, setFileHash] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentType>('property')
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadedDocId, setUploadedDocId] = useState<string | null>(null)
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
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      const hash = await generateHash(droppedFile)
      setFileHash(hash)
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      const hash = await generateHash(selectedFile)
      setFileHash(hash)
    }
  }

  const removeFile = () => {
    setFile(null)
    setFileHash(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return

    setIsUploading(true)

    try {
      const doc = await uploadDocument(
        file,
        title,
        type,
        description,
        user.id,
        user.name
      )
      setUploadedDocId(doc.id)
      setUploadComplete(true)
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12">
          <Card className="mx-auto max-w-lg border-border bg-card text-center">
            <CardContent className="py-12">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">Document Registered!</h2>
              <p className="mb-6 text-muted-foreground">
                Your document has been securely stored and registered on the blockchain.
              </p>
              
              <div className="mb-6 rounded-lg border border-border bg-secondary/30 p-4 text-left">
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Document Hash</span>
                </div>
                <code className="block break-all font-mono text-xs text-foreground">
                  {fileHash}
                </code>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href={`/document/${uploadedDocId}`}>
                  <Button className="w-full sm:w-auto">View Document</Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadComplete(false)
                    setFile(null)
                    setFileHash(null)
                    setTitle('')
                    setDescription('')
                  }}
                >
                  Upload Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
            <p className="mt-2 text-muted-foreground">
              Securely upload and register your legal document on the blockchain
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-6">
              {/* File Upload Area */}
              <Field>
                <FieldLabel>Document File</FieldLabel>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                    dragActive
                      ? 'border-primary bg-primary/5'
                      : file
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {file ? (
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="rounded-full p-1 hover:bg-destructive/20"
                      >
                        <X className="h-5 w-5 text-destructive" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
                      <p className="mb-2 text-center font-medium">
                        Drag and drop your file here
                      </p>
                      <p className="mb-4 text-center text-sm text-muted-foreground">
                        or click to browse
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </Field>

              {/* Hash Preview */}
              {fileHash && (
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Cryptographic Hash Generated</span>
                  </div>
                  <code className="block break-all font-mono text-xs text-muted-foreground">
                    {formatHash(fileHash, 20)}...
                  </code>
                  <p className="mt-2 text-xs text-muted-foreground">
                    This unique fingerprint will be stored on the blockchain for verification.
                  </p>
                </div>
              )}

              {/* Document Details */}
              <Field>
                <FieldLabel htmlFor="title">Document Title</FieldLabel>
                <Input
                  id="title"
                  placeholder="e.g., Property Deed - Plot No. 42"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isUploading}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="type">Document Type</FieldLabel>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as DocumentType)}
                  disabled={isUploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((dt) => (
                      <SelectItem key={dt.value} value={dt.value}>
                        {dt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description (Optional)</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Add any additional details about this document..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isUploading}
                  rows={3}
                />
              </Field>

              {/* Info Box */}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="flex items-start gap-3 py-4">
                  <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Blockchain Registration</p>
                    <p className="text-xs text-muted-foreground">
                      We store only the cryptographic hash of your document on the blockchain,
                      ensuring security, scalability, and privacy. The actual file is stored
                      securely in our encrypted vault.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!file || !title || isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Registering on Blockchain...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Register Document
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>
        </div>
      </main>
    </div>
  )
}
