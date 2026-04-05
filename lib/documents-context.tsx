'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { LegalDocument, ActivityLog, DocumentType, DocumentStatus } from './types'
import { generateHash, createDocumentVersion } from './blockchain'

interface DocumentsContextType {
  documents: LegalDocument[]
  activities: ActivityLog[]
  uploadDocument: (
    file: File,
    title: string,
    type: DocumentType,
    description: string,
    userId: string,
    userName: string
  ) => Promise<LegalDocument>
  uploadNewVersion: (
    documentId: string,
    file: File,
    notes: string,
    userId: string
  ) => Promise<LegalDocument | null>
  revokeDocument: (documentId: string, userId: string) => Promise<boolean>
  getDocument: (id: string) => LegalDocument | undefined
  getUserDocuments: (userId: string) => LegalDocument[]
  getDocumentActivities: (documentId: string) => ActivityLog[]
  addActivity: (activity: Omit<ActivityLog, 'id'>) => void
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined)

// Sample demo documents
const DEMO_DOCUMENTS: LegalDocument[] = [
  {
    id: '1',
    title: 'Property Deed - Plot No. 42',
    type: 'property',
    description: 'Registered property deed for residential plot in Sector 15, Noida',
    fileName: 'property_deed_42.pdf',
    fileSize: 2456789,
    ownerId: '1',
    ownerName: 'Rahul Sharma',
    currentVersion: 1,
    status: 'active',
    versions: [
      {
        version: 1,
        hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        uploadedAt: new Date('2024-02-15'),
        status: 'active',
        blockchainRecord: {
          transactionHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
          blockNumber: 1001,
          timestamp: new Date('2024-02-15'),
          hash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
        },
      },
    ],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    sharedWith: [],
  },
  {
    id: '2',
    title: 'Affidavit - Name Change',
    type: 'affidavit',
    description: 'Legal affidavit for official name change documentation',
    fileName: 'affidavit_name_change.pdf',
    fileSize: 1234567,
    ownerId: '1',
    ownerName: 'Rahul Sharma',
    currentVersion: 2,
    status: 'active',
    versions: [
      {
        version: 1,
        hash: 'z1y2x3w4v5u6t7s8r9q0p1o2n3m4l5k6j7i8h9g0f1e2d3c4b5a6',
        uploadedAt: new Date('2024-01-20'),
        status: 'revoked',
        blockchainRecord: {
          transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
          blockNumber: 1000,
          timestamp: new Date('2024-01-20'),
          hash: 'z1y2x3w4v5u6t7s8r9q0p1o2n3m4l5k6j7i8h9g0f1e2d3c4b5a6',
        },
        notes: 'Initial version with error',
      },
      {
        version: 2,
        hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7',
        uploadedAt: new Date('2024-02-01'),
        status: 'active',
        blockchainRecord: {
          transactionHash: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c',
          blockNumber: 1002,
          timestamp: new Date('2024-02-01'),
          hash: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7',
        },
        notes: 'Corrected version with proper details',
      },
    ],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01'),
    sharedWith: ['2'],
  },
  {
    id: '3',
    title: 'Court Order - Case No. 2024/123',
    type: 'court_order',
    description: 'Final judgment order from District Court',
    fileName: 'court_order_2024_123.pdf',
    fileSize: 3456789,
    ownerId: '2',
    ownerName: 'Adv. Priya Patel',
    currentVersion: 1,
    status: 'active',
    versions: [
      {
        version: 1,
        hash: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8',
        uploadedAt: new Date('2024-03-01'),
        status: 'active',
        blockchainRecord: {
          transactionHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
          blockNumber: 1003,
          timestamp: new Date('2024-03-01'),
          hash: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8',
        },
      },
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
    sharedWith: ['1'],
  },
]

const DEMO_ACTIVITIES: ActivityLog[] = [
  {
    id: '1',
    documentId: '1',
    documentTitle: 'Property Deed - Plot No. 42',
    action: 'upload',
    performedBy: 'Rahul Sharma',
    performedAt: new Date('2024-02-15'),
    details: 'Document uploaded and registered on blockchain',
  },
  {
    id: '2',
    documentId: '2',
    documentTitle: 'Affidavit - Name Change',
    action: 'new_version',
    performedBy: 'Rahul Sharma',
    performedAt: new Date('2024-02-01'),
    details: 'New version uploaded, previous version revoked',
  },
  {
    id: '3',
    documentId: '2',
    documentTitle: 'Affidavit - Name Change',
    action: 'verify',
    performedBy: 'Adv. Priya Patel',
    performedAt: new Date('2024-02-05'),
    details: 'Document verified as authentic',
  },
]

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<LegalDocument[]>(DEMO_DOCUMENTS)
  const [activities, setActivities] = useState<ActivityLog[]>(DEMO_ACTIVITIES)

  const addActivity = (activity: Omit<ActivityLog, 'id'>) => {
    const newActivity: ActivityLog = {
      ...activity,
      id: String(activities.length + 1),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  const uploadDocument = async (
    file: File,
    title: string,
    type: DocumentType,
    description: string,
    userId: string,
    userName: string
  ): Promise<LegalDocument> => {
    const hash = await generateHash(file)
    const version = await createDocumentVersion(hash, 1)

    const newDoc: LegalDocument = {
      id: String(documents.length + 1),
      title,
      type,
      description,
      fileName: file.name,
      fileSize: file.size,
      ownerId: userId,
      ownerName: userName,
      currentVersion: 1,
      status: 'active',
      versions: [version],
      createdAt: new Date(),
      updatedAt: new Date(),
      sharedWith: [],
    }

    setDocuments((prev) => [newDoc, ...prev])
    
    addActivity({
      documentId: newDoc.id,
      documentTitle: newDoc.title,
      action: 'upload',
      performedBy: userName,
      performedAt: new Date(),
      details: `Document uploaded and registered on blockchain. Block #${version.blockchainRecord.blockNumber}`,
    })

    return newDoc
  }

  const uploadNewVersion = async (
    documentId: string,
    file: File,
    notes: string,
    userId: string
  ): Promise<LegalDocument | null> => {
    const doc = documents.find((d) => d.id === documentId)
    if (!doc) return null

    const hash = await generateHash(file)
    const newVersionNumber = doc.currentVersion + 1
    const version = await createDocumentVersion(hash, newVersionNumber, 'active', notes)

    const updatedDoc: LegalDocument = {
      ...doc,
      fileName: file.name,
      fileSize: file.size,
      currentVersion: newVersionNumber,
      status: 'active',
      versions: [
        ...doc.versions.map((v) =>
          v.status === 'active' ? { ...v, status: 'revoked' as DocumentStatus } : v
        ),
        version,
      ],
      updatedAt: new Date(),
    }

    setDocuments((prev) =>
      prev.map((d) => (d.id === documentId ? updatedDoc : d))
    )

    addActivity({
      documentId,
      documentTitle: doc.title,
      action: 'new_version',
      performedBy: doc.ownerName,
      performedAt: new Date(),
      details: `Version ${newVersionNumber} uploaded. Previous version revoked. ${notes}`,
    })

    return updatedDoc
  }

  const revokeDocument = async (
    documentId: string,
    userId: string
  ): Promise<boolean> => {
    const doc = documents.find((d) => d.id === documentId)
    if (!doc || doc.ownerId !== userId) return false

    const updatedDoc: LegalDocument = {
      ...doc,
      status: 'revoked',
      versions: doc.versions.map((v) =>
        v.status === 'active' ? { ...v, status: 'revoked' as DocumentStatus } : v
      ),
      updatedAt: new Date(),
    }

    setDocuments((prev) =>
      prev.map((d) => (d.id === documentId ? updatedDoc : d))
    )

    addActivity({
      documentId,
      documentTitle: doc.title,
      action: 'revoke',
      performedBy: doc.ownerName,
      performedAt: new Date(),
      details: 'Document has been revoked by owner',
    })

    return true
  }

  const getDocument = (id: string) => documents.find((d) => d.id === id)

  const getUserDocuments = (userId: string) =>
    documents.filter((d) => d.ownerId === userId || d.sharedWith.includes(userId))

  const getDocumentActivities = (documentId: string) =>
    activities.filter((a) => a.documentId === documentId)

  return (
    <DocumentsContext.Provider
      value={{
        documents,
        activities,
        uploadDocument,
        uploadNewVersion,
        revokeDocument,
        getDocument,
        getUserDocuments,
        getDocumentActivities,
        addActivity,
      }}
    >
      {children}
    </DocumentsContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentsContext)
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentsProvider')
  }
  return context
}
