export type UserRole = 'citizen' | 'authority'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
}

export type DocumentStatus = 'active' | 'revoked' | 'pending'

export type DocumentType = 
  | 'property'
  | 'affidavit'
  | 'court_order'
  | 'identity'
  | 'contract'
  | 'other'

export interface BlockchainRecord {
  transactionHash: string
  blockNumber: number
  timestamp: Date
  hash: string
}

export interface DocumentVersion {
  version: number
  hash: string
  uploadedAt: Date
  status: DocumentStatus
  blockchainRecord: BlockchainRecord
  notes?: string
}

export interface LegalDocument {
  id: string
  title: string
  type: DocumentType
  description: string
  fileName: string
  fileSize: number
  ownerId: string
  ownerName: string
  currentVersion: number
  status: DocumentStatus
  versions: DocumentVersion[]
  createdAt: Date
  updatedAt: Date
  sharedWith: string[]
}

export interface ActivityLog {
  id: string
  documentId: string
  documentTitle: string
  action: 'upload' | 'verify' | 'view' | 'share' | 'revoke' | 'new_version'
  performedBy: string
  performedAt: Date
  details?: string
  ipAddress?: string
}

export interface VerificationResult {
  isAuthentic: boolean
  documentId?: string
  documentTitle?: string
  ownerName?: string
  currentStatus?: DocumentStatus
  blockchainRecord?: BlockchainRecord
  message: string
}
