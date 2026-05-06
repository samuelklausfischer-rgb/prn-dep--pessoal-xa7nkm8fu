migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('documents')
    if (!col.fields.getByName('urgency')) {
      col.fields.add(
        new SelectField({ name: 'urgency', values: ['low', 'medium', 'high'], maxSelect: 1 }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('documents')
    col.fields.removeByName('urgency')
    app.save(col)
  },
)
