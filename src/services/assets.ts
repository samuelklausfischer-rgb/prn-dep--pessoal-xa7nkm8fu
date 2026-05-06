import pb from '@/lib/pocketbase/client'

export async function getAssets() {
  return pb.collection('assets').getFullList({ expand: 'unit', sort: '-updated' })
}

export async function updateAsset(id: string, data: any) {
  return pb.collection('assets').update(id, data)
}

export async function createAsset(data: any) {
  return pb.collection('assets').create(data)
}

export async function deleteAsset(id: string) {
  return pb.collection('assets').delete(id)
}

export async function getUnits() {
  return pb.collection('units').getFullList()
}
