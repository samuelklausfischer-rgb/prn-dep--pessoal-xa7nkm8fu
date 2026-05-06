migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'samuelklausfischer@hotmail.com')
    } catch (_) {
      const admin = new Record(users)
      admin.setEmail('samuelklausfischer@hotmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin')
      app.save(admin)
    }

    const units = app.findCollectionByNameOrId('units')
    try {
      app.findFirstRecordByData('units', 'slug', 'prn-diagnosticos')
    } catch (_) {
      const unitPrn = new Record(units)
      unitPrn.set('name', 'PRN Diagnósticos')
      unitPrn.set('slug', 'prn-diagnosticos')
      app.save(unitPrn)
    }

    try {
      app.findFirstRecordByData('units', 'slug', 'medimagem')
    } catch (_) {
      const unitMed = new Record(units)
      unitMed.set('name', 'Medimagem')
      unitMed.set('slug', 'medimagem')
      app.save(unitMed)
    }
  },
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'samuelklausfischer@hotmail.com')
      app.delete(admin)
    } catch (_) {}

    try {
      const unitPrn = app.findFirstRecordByData('units', 'slug', 'prn-diagnosticos')
      app.delete(unitPrn)
    } catch (_) {}

    try {
      const unitMed = app.findFirstRecordByData('units', 'slug', 'medimagem')
      app.delete(unitMed)
    } catch (_) {}
  },
)
