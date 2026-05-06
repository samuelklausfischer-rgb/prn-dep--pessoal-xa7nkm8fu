import pb from '@/lib/pocketbase/client'

export type ValidationRecord = {
  id: string
  collectionName: 'personnel' | 'assets' | 'documents'
  title: string
  type: string
  unitName: string
  workflow_status: string
  created: string
  raw: any
  confidence: 'high' | 'medium' | 'low'
  issues: string[]
}

const parseNotes = (notes: any) => {
  if (!notes) return { confidence: 'high' as const, issues: [] }
  try {
    const parsed = typeof notes === 'string' ? JSON.parse(notes) : notes
    return {
      confidence: parsed.confidence || 'high',
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    }
  } catch {
    return { confidence: 'medium' as const, issues: [] }
  }
}

export const getPendingValidations = async (): Promise<ValidationRecord[]> => {
  const filter = 'workflow_status="Extracted (IA)" || workflow_status="Pending Conference"'
  const expand = 'unit'

  const [personnel, assets, documents] = await Promise.all([
    pb.collection('personnel').getFullList({ filter, expand }),
    pb.collection('assets').getFullList({ filter, expand }),
    pb.collection('documents').getFullList({ filter, expand }),
  ])

  const mapRecord =
    (col: 'personnel' | 'assets' | 'documents') =>
    (record: any): ValidationRecord => {
      const { confidence, issues } = parseNotes(record.notes)
      return {
        id: record.id,
        collectionName: col,
        title: record.name || record.title || 'Sem título',
        type:
          col === 'personnel'
            ? 'Colaborador'
            : col === 'assets'
              ? 'Ativo/Equipamento'
              : 'Documento',
        unitName: record.expand?.unit?.name || 'Não atribuída',
        workflow_status: record.workflow_status,
        created: record.created,
        raw: record,
        confidence,
        issues,
      }
    }

  return [
    ...personnel.map(mapRecord('personnel')),
    ...assets.map(mapRecord('assets')),
    ...documents.map(mapRecord('documents')),
  ].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
}

export const updateValidationStatus = async (collectionName: string, id: string, data: any) => {
  return pb.collection(collectionName).update(id, data)
}
