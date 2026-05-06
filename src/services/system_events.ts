import pb from '@/lib/pocketbase/client'

export interface SystemEvent {
  id: string
  type: string
  description: string
  entity_id?: string
  entity_type?: string
  severity: 'info' | 'warning' | 'critical'
  unit?: string
  user?: string
  created: string
  expand?: {
    unit?: { id: string; name: string }
    user?: { id: string; name: string; email: string }
  }
}

export const getSystemEvents = () => {
  return pb.collection('system_events').getFullList<SystemEvent>({
    sort: '-created',
    expand: 'unit,user',
  })
}
