migrate(
  (app) => {
    const collection = new Collection({
      name: 'system_events',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'type', type: 'text', required: true },
        { name: 'description', type: 'text', required: true },
        { name: 'entity_id', type: 'text' },
        { name: 'entity_type', type: 'text' },
        {
          name: 'severity',
          type: 'select',
          values: ['info', 'warning', 'critical'],
          required: true,
        },
        {
          name: 'unit',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('units').id,
          maxSelect: 1,
        },
        { name: 'user', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_system_events_created ON system_events (created DESC)',
        'CREATE INDEX idx_system_events_entity ON system_events (entity_type, entity_id)',
      ],
    })
    app.save(collection)

    try {
      app.findFirstRecordByData('system_events', 'type', 'system_init')
    } catch (_) {
      const record = new Record(collection)
      record.set('type', 'system_init')
      record.set('description', 'Sistema de Gestão PRN inicializado.')
      record.set('severity', 'info')
      app.save(record)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('system_events')
    app.delete(collection)
  },
)
