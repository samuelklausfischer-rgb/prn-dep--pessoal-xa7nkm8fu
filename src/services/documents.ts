import pb from '@/lib/pocketbase/client'

export interface Document {
  id: string
  title: string
  type: string
  status: 'pending' | 'validated'
  file?: string
  uploaded_by?: string
  workflow_status: string
  due_date?: string
  cost?: number
  weight?: number
  notes?: any
  issue_date?: string
  unit?: string
  created: string
  updated: string
  urgency?: 'low' | 'medium' | 'high'
  expand?: {
    unit?: { id: string; name: string }
    uploaded_by?: { id: string; name: string; avatar?: string }
  }
}

export const getAllDocuments = () => {
  return pb.collection('documents').getFullList<Document>({
    expand: 'unit,uploaded_by',
    sort: 'due_date',
  })
}

export const getComplianceDocuments = () => {
  return pb.collection('documents').getFullList<Document>({
    expand: 'unit,uploaded_by',
    sort: 'due_date',
    filter: 'type="Exame" || type="Treinamento" || type="Certificação"',
  })
}

export const createDocument = (data: Partial<Document>) => {
  return pb.collection('documents').create(data)
}

export const updateDocument = (id: string, data: Partial<Document>) => {
  return pb.collection('documents').update(id, data)
}

export const deleteDocument = (id: string) => {
  return pb.collection('documents').delete(id)
}
