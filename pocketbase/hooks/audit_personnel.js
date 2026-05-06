onRecordCreateRequest((e) => {
  e.next()
  try {
    const eventsCol = $app.findCollectionByNameOrId('system_events')
    const event = new Record(eventsCol)
    event.set('type', 'new_record')
    event.set('description', `Novo colaborador cadastrado: ${e.record.getString('name')}`)
    event.set('entity_id', e.record.id)
    event.set('entity_type', 'personnel')
    event.set('severity', 'info')
    event.set('unit', e.record.get('unit'))
    if (e.auth) event.set('user', e.auth.id)
    $app.save(event)
  } catch (err) {
    $app.logger().error('Failed to create system event', 'error', err.message)
  }
}, 'personnel')

onRecordUpdateRequest((e) => {
  e.next()
  try {
    const eventsCol = $app.findCollectionByNameOrId('system_events')
    const event = new Record(eventsCol)
    event.set('type', 'status_change')
    event.set('description', `Colaborador atualizado: ${e.record.getString('name')}`)
    event.set('entity_id', e.record.id)
    event.set('entity_type', 'personnel')
    event.set('severity', 'info')
    event.set('unit', e.record.get('unit'))
    if (e.auth) event.set('user', e.auth.id)
    $app.save(event)
  } catch (err) {
    $app.logger().error('Failed to create system event', 'error', err.message)
  }
}, 'personnel')

onRecordDeleteRequest((e) => {
  const name = e.record.getString('name')
  const unit = e.record.get('unit')
  const entityId = e.record.id
  const authId = e.auth ? e.auth.id : null

  e.next()

  try {
    const eventsCol = $app.findCollectionByNameOrId('system_events')
    const event = new Record(eventsCol)
    event.set('type', 'deleted_record')
    event.set('description', `Colaborador removido: ${name}`)
    event.set('entity_id', entityId)
    event.set('entity_type', 'personnel')
    event.set('severity', 'warning')
    event.set('unit', unit)
    if (authId) event.set('user', authId)
    $app.save(event)
  } catch (err) {
    $app.logger().error('Failed to create system event', 'error', err.message)
  }
}, 'personnel')
