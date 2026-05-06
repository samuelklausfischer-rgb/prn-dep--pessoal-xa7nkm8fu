migrate(
  (app) => {
    const units = new Collection({
      name: 'units',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(units)

    const personnel = new Collection({
      name: 'personnel',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'role', type: 'text' },
        { name: 'status', type: 'select', values: ['active', 'pending', 'inactive'], maxSelect: 1 },
        { name: 'admission_date', type: 'date' },
        { name: 'unit', type: 'relation', collectionId: units.id, maxSelect: 1 },
        { name: 'observations', type: 'text' },
        {
          name: 'workflow_status',
          type: 'select',
          values: [
            'Extracted (IA)',
            'Pending Conference',
            'Validated by Finance',
            'Completed/Archived',
          ],
          maxSelect: 1,
        },
        { name: 'due_date', type: 'date' },
        { name: 'cost', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'notes', type: 'json' },
        { name: 'probation_45', type: 'date' },
        { name: 'probation_90', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(personnel)

    const assets = new Collection({
      name: 'assets',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'category', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['operational', 'maintenance', 'offline'],
          maxSelect: 1,
        },
        { name: 'unit', type: 'relation', collectionId: units.id, maxSelect: 1 },
        { name: 'serial_number', type: 'text' },
        {
          name: 'workflow_status',
          type: 'select',
          values: [
            'Extracted (IA)',
            'Pending Conference',
            'Validated by Finance',
            'Completed/Archived',
          ],
          maxSelect: 1,
        },
        { name: 'due_date', type: 'date' },
        { name: 'cost', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'notes', type: 'json' },
        { name: 'brand', type: 'text' },
        { name: 'model', type: 'text' },
        { name: 'responsible_company', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(assets)

    const documents = new Collection({
      name: 'documents',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'type', type: 'text' },
        { name: 'status', type: 'select', values: ['pending', 'validated'], maxSelect: 1 },
        { name: 'file', type: 'file', maxSelect: 1, maxSize: 5242880 },
        { name: 'uploaded_by', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        {
          name: 'workflow_status',
          type: 'select',
          values: [
            'Extracted (IA)',
            'Pending Conference',
            'Validated by Finance',
            'Completed/Archived',
          ],
          maxSelect: 1,
        },
        { name: 'due_date', type: 'date' },
        { name: 'cost', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'notes', type: 'json' },
        { name: 'issue_date', type: 'date' },
        { name: 'unit', type: 'relation', collectionId: units.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(documents)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('documents'))
    app.delete(app.findCollectionByNameOrId('assets'))
    app.delete(app.findCollectionByNameOrId('personnel'))
    app.delete(app.findCollectionByNameOrId('units'))
  },
)
