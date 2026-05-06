import pb from '@/lib/pocketbase/client'

export interface Personnel {
  id: string
  name: string
  role: string
  status: 'active' | 'pending' | 'inactive'
  admission_date?: string
  probation_45?: string
  probation_90?: string
  observations?: string
  workflow_status: string
  unit: string
  created: string
  expand?: {
    unit?: { id: string; name: string }
  }
}

export const getPersonnelList = () => {
  return pb.collection('personnel').getFullList<Personnel>({
    expand: 'unit',
    sort: '-created',
  })
}

export const getUnits = () => {
  return pb.collection('units').getFullList()
}

export const createPersonnel = (data: Partial<Personnel>) => {
  return pb.collection('personnel').create(data)
}

export const updatePersonnel = (id: string, data: Partial<Personnel>) => {
  return pb.collection('personnel').update(id, data)
}

export const deletePersonnel = (id: string) => {
  return pb.collection('personnel').delete(id)
}
