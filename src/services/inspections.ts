import pb from '@/lib/pocketbase/client'

export interface Inspection {
  id: string
  title: string
  type: string
  status: 'planned' | 'pending' | 'completed' | 'overdue'
  criticality: 'low' | 'medium' | 'high'
  unit: string
  scheduled_date: string
  completed_date?: string
  inspector?: string
  notes?: string
  created: string
  updated: string
  expand?: {
    unit?: { id: string; name: string }
  }
}

export const getInspections = () => {
  return pb.collection('inspections').getFullList<Inspection>({
    expand: 'unit',
    sort: '-scheduled_date',
  })
}

export const createInspection = (data: Partial<Inspection>) => {
  return pb.collection('inspections').create(data)
}

export const updateInspection = (id: string, data: Partial<Inspection>) => {
  return pb.collection('inspections').update(id, data)
}

export const deleteInspection = (id: string) => {
  return pb.collection('inspections').delete(id)
}
