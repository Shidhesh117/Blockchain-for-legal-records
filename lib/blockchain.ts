import type { BlockchainRecord, DocumentVersion, LegalDocument, VerificationResult, DocumentStatus } from './types'

// Simulated blockchain storage
const blockchainLedger: Map<string, BlockchainRecord> = new Map()
let blockNumber = 1000

// Generate SHA-256 hash from file content
export async function generateHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Generate hash from string (for demo purposes)
export async function generateHashFromString(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Generate a realistic-looking transaction hash
function generateTransactionHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

// Store hash on blockchain (simulated)
export async function storeOnBlockchain(hash: string): Promise<BlockchainRecord> {
  // Simulate blockchain transaction delay
  await new Promise((r) => setTimeout(r, 1500))
  
  blockNumber++
  
  const record: BlockchainRecord = {
    transactionHash: generateTransactionHash(),
    blockNumber,
    timestamp: new Date(),
    hash,
  }
  
  blockchainLedger.set(hash, record)
  return record
}

// Verify document against blockchain
export async function verifyDocument(
  file: File,
  documents: LegalDocument[]
): Promise<VerificationResult> {
  // Simulate verification delay
  await new Promise((r) => setTimeout(r, 1200))
  
  const hash = await generateHash(file)
  
  // Search through all documents and versions
  for (const doc of documents) {
    for (const version of doc.versions) {
      if (version.hash === hash) {
        return {
          isAuthentic: true,
          documentId: doc.id,
          documentTitle: doc.title,
          ownerName: doc.ownerName,
          currentStatus: version.status,
          blockchainRecord: version.blockchainRecord,
          message: version.status === 'active' 
            ? 'Document is authentic and currently active'
            : `Document is authentic but has been marked as ${version.status}`,
        }
      }
    }
  }
  
  return {
    isAuthentic: false,
    message: 'Document hash not found on blockchain. This document may be tampered with or was never registered.',
  }
}

// Create new document version
export async function createDocumentVersion(
  hash: string,
  versionNumber: number,
  status: DocumentStatus = 'active',
  notes?: string
): Promise<DocumentVersion> {
  const blockchainRecord = await storeOnBlockchain(hash)
  
  return {
    version: versionNumber,
    hash,
    uploadedAt: new Date(),
    status,
    blockchainRecord,
    notes,
  }
}

// Format hash for display (truncated)
export function formatHash(hash: string, length: number = 8): string {
  if (hash.length <= length * 2) return hash
  return `${hash.slice(0, length)}...${hash.slice(-length)}`
}

// Format transaction hash for display
export function formatTxHash(txHash: string): string {
  return `${txHash.slice(0, 10)}...${txHash.slice(-8)}`
}
