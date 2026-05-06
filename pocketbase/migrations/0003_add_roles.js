migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'financeiro'],
          maxSelect: 1,
          required: true,
        }),
      )
      app.save(users)
    }

    try {
      const admin = app.findAuthRecordByEmail('users', 'samuelklausfischer@hotmail.com')
      admin.set('role', 'admin')
      app.save(admin)
    } catch (_) {
      const record = new Record(users)
      record.setEmail('samuelklausfischer@hotmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Samuel (Chefe)')
      record.set('role', 'admin')
      app.save(record)
    }

    try {
      const financeiro = app.findAuthRecordByEmail('users', 'financeiro@prndiagnosticos.com.br')
      financeiro.set('role', 'financeiro')
      app.save(financeiro)
    } catch (_) {
      const record = new Record(users)
      record.setEmail('financeiro@prndiagnosticos.com.br')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Financeiro PRN')
      record.set('role', 'financeiro')
      app.save(record)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    users.fields.removeByName('role')
    app.save(users)
  },
)
