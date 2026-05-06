migrate(
  (app) => {
    const collection = new Collection({
      name: 'inspections',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'type', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['planned', 'pending', 'completed', 'overdue'],
          maxSelect: 1,
        },
        { name: 'criticality', type: 'select', values: ['low', 'medium', 'high'], maxSelect: 1 },
        {
          name: 'unit',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('units').id,
          maxSelect: 1,
        },
        { name: 'scheduled_date', type: 'date' },
        { name: 'completed_date', type: 'date' },
        { name: 'inspector', type: 'text' },
        { name: 'notes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('inspections')
    app.delete(collection)
  },
)
