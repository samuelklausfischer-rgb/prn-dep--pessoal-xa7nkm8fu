import pb from '@/lib/pocketbase/client'
import type { DashboardItem } from '@/types'

const formatDate = (d?: string) => (d ? d.substring(0, 10) : '')

export async function getDashboardItems(): Promise<DashboardItem[]> {
  const [personnel, assets, documents] = await Promise.all([
    pb.collection('personnel').getFullList({ expand: 'unit' }),
    pb.collection('assets').getFullList({ expand: 'unit' }),
    pb.collection('documents').getFullList({ expand: 'unit' }),
  ])

  const items: DashboardItem[] = []

  for (const p of personnel) {
    items.push({
      id: p.id,
      name: p.name,
      unit: (p.expand?.unit?.name as any) || 'PRN Diagnósticos',
      category: 'Human Capital',
      status: p.workflow_status || 'Extracted (IA)',
      weight: p.weight || 2,
      dueDate: formatDate(p.due_date),
      cost: p.cost || 0,
      notes: p.notes || [],
      role: p.role,
      admissionDate: formatDate(p.admission_date),
      probation45Date: formatDate(p.probation_45),
      probation90Date: formatDate(p.probation_90),
    })
  }

  for (const a of assets) {
    items.push({
      id: a.id,
      name: a.name,
      unit: (a.expand?.unit?.name as any) || 'PRN Diagnósticos',
      category: 'Technical Asset',
      status: a.workflow_status || 'Extracted (IA)',
      weight: a.weight || 3,
      dueDate: formatDate(a.due_date),
      cost: a.cost || 0,
      notes: a.notes || [],
      brand: a.brand,
      model: a.model,
      serialNumber: a.serial_number,
      responsibleCompany: a.responsible_company,
    })
  }

  for (const d of documents) {
    items.push({
      id: d.id,
      name: d.title,
      unit: (d.expand?.unit?.name as any) || 'PRN Diagnósticos',
      category: 'Legal Documentation',
      status: d.workflow_status || 'Extracted (IA)',
      weight: d.weight || 1,
      dueDate: formatDate(d.due_date),
      cost: d.cost || 0,
      notes: d.notes || [],
      docType: d.type as any,
      issueDate: formatDate(d.issue_date),
    })
  }

  return items
}

async function getUnitId(name: string) {
  const units = await pb.collection('units').getFullList()
  return units.find((u) => u.name === name)?.id
}

export async function createDashboardItem(item: Partial<DashboardItem>) {
  const col =
    item.category === 'Human Capital'
      ? 'personnel'
      : item.category === 'Technical Asset'
        ? 'assets'
        : 'documents'

  const unitId = item.unit ? await getUnitId(item.unit) : null

  const data: any = {
    workflow_status: item.status,
    due_date: item.dueDate ? new Date(item.dueDate).toISOString() : null,
    cost: item.cost,
    weight: item.weight,
    notes: item.notes || [],
    unit: unitId,
  }

  if (col === 'personnel') {
    data.name = item.name
    data.role = (item as any).role
    data.admission_date = (item as any).admissionDate
      ? new Date((item as any).admissionDate).toISOString()
      : null
    data.probation_45 = (item as any).probation45Date
      ? new Date((item as any).probation45Date).toISOString()
      : null
    data.probation_90 = (item as any).probation90Date
      ? new Date((item as any).probation90Date).toISOString()
      : null
    data.status = 'active'
  } else if (col === 'assets') {
    data.name = item.name
    data.brand = (item as any).brand
    data.model = (item as any).model
    data.serial_number = (item as any).serialNumber
    data.responsible_company = (item as any).responsibleCompany
    data.status = 'operational'
  } else if (col === 'documents') {
    data.title = item.name
    data.type = (item as any).docType
    data.issue_date = (item as any).issueDate
      ? new Date((item as any).issueDate).toISOString()
      : null
    data.status = 'pending'
  }

  return pb.collection(col).create(data)
}

export async function updateDashboardItem(
  id: string,
  category: string,
  updates: Partial<DashboardItem>,
) {
  const col =
    category === 'Human Capital'
      ? 'personnel'
      : category === 'Technical Asset'
        ? 'assets'
        : 'documents'

  const data: any = {}

  if (updates.status) data.workflow_status = updates.status
  if (updates.dueDate !== undefined)
    data.due_date = updates.dueDate ? new Date(updates.dueDate).toISOString() : null
  if (updates.cost !== undefined) data.cost = updates.cost
  if (updates.notes) data.notes = updates.notes

  if (updates.unit) {
    data.unit = await getUnitId(updates.unit)
  }

  if (col === 'personnel') {
    if (updates.name) data.name = updates.name
    if ((updates as any).role !== undefined) data.role = (updates as any).role
    if ((updates as any).admissionDate !== undefined)
      data.admission_date = (updates as any).admissionDate
        ? new Date((updates as any).admissionDate).toISOString()
        : null
    if ((updates as any).probation45Date !== undefined)
      data.probation_45 = (updates as any).probation45Date
        ? new Date((updates as any).probation45Date).toISOString()
        : null
    if ((updates as any).probation90Date !== undefined)
      data.probation_90 = (updates as any).probation90Date
        ? new Date((updates as any).probation90Date).toISOString()
        : null
  } else if (col === 'assets') {
    if (updates.name) data.name = updates.name
    if ((updates as any).brand !== undefined) data.brand = (updates as any).brand
    if ((updates as any).model !== undefined) data.model = (updates as any).model
    if ((updates as any).serialNumber !== undefined)
      data.serial_number = (updates as any).serialNumber
    if ((updates as any).responsibleCompany !== undefined)
      data.responsible_company = (updates as any).responsibleCompany
  } else if (col === 'documents') {
    if (updates.name) data.title = updates.name
    if ((updates as any).docType !== undefined) data.type = (updates as any).docType
    if ((updates as any).issueDate !== undefined)
      data.issue_date = (updates as any).issueDate
        ? new Date((updates as any).issueDate).toISOString()
        : null
  }

  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key])
  return pb.collection(col).update(id, data)
}

export async function deleteDashboardItem(id: string, category: string) {
  const col =
    category === 'Human Capital'
      ? 'personnel'
      : category === 'Technical Asset'
        ? 'assets'
        : 'documents'
  return pb.collection(col).delete(id)
}
