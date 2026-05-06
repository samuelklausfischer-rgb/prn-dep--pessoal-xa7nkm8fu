migrate(
  (app) => {
    const unitsCol = app.findCollectionByNameOrId('units')
    const units = app.findRecordsByFilter('units', '1=1', '', 10, 0)
    let unit1Id = ''
    let unit2Id = ''

    if (units.length > 0) {
      unit1Id = units[0].id
      unit2Id = units.length > 1 ? units[1].id : unit1Id
    } else {
      const unit = new Record(unitsCol)
      unit.set('name', 'Unidade Sede')
      unit.set('slug', 'sede')
      app.save(unit)
      unit1Id = unit.id
      unit2Id = unit.id
    }

    const inspCol = app.findCollectionByNameOrId('inspections')

    try {
      app.findFirstRecordByData('inspections', 'title', 'Inspeção Elétrica Semestral')
    } catch (_) {
      const r1 = new Record(inspCol)
      r1.set('title', 'Inspeção Elétrica Semestral')
      r1.set('type', 'Manutenção')
      r1.set('status', 'completed')
      r1.set('criticality', 'high')
      r1.set('unit', unit1Id)
      r1.set('scheduled_date', new Date(Date.now() - 10 * 86400000).toISOString())
      r1.set('completed_date', new Date(Date.now() - 8 * 86400000).toISOString())
      r1.set('inspector', 'Carlos Silva')
      r1.set('notes', 'Sem irregularidades na vistoria técnica.')
      app.save(r1)
    }

    try {
      app.findFirstRecordByData('inspections', 'title', 'Calibração de Raio-X')
    } catch (_) {
      const r2 = new Record(inspCol)
      r2.set('title', 'Calibração de Raio-X')
      r2.set('type', 'Calibração')
      r2.set('status', 'pending')
      r2.set('criticality', 'medium')
      r2.set('unit', unit1Id)
      r2.set('scheduled_date', new Date(Date.now() + 5 * 86400000).toISOString())
      r2.set('inspector', 'Ana Costa')
      r2.set('notes', 'Equipamento principal de imagem. Necessário atenção.')
      app.save(r2)
    }

    try {
      app.findFirstRecordByData('inspections', 'title', 'Vistoria Alvará Bombeiros')
    } catch (_) {
      const r3 = new Record(inspCol)
      r3.set('title', 'Vistoria Alvará Bombeiros')
      r3.set('type', 'Legal')
      r3.set('status', 'overdue')
      r3.set('criticality', 'high')
      r3.set('unit', unit2Id)
      r3.set('scheduled_date', new Date(Date.now() - 5 * 86400000).toISOString())
      r3.set('inspector', 'Sgt. Oliveira')
      r3.set('notes', 'Atraso pendente de renovação do projeto de prevenção.')
      app.save(r3)
    }

    const docCol = app.findCollectionByNameOrId('documents')

    try {
      app.findFirstRecordByData('documents', 'title', 'Alvará Sanitário Sede')
    } catch (_) {
      const d1 = new Record(docCol)
      d1.set('title', 'Alvará Sanitário Sede')
      d1.set('type', 'Alvará')
      d1.set('status', 'validated')
      d1.set('urgency', 'low')
      d1.set('unit', unit1Id)
      d1.set('due_date', new Date(Date.now() + 180 * 86400000).toISOString())
      d1.set('issue_date', new Date(Date.now() - 180 * 86400000).toISOString())
      app.save(d1)
    }

    try {
      app.findFirstRecordByData('documents', 'title', 'Licença Ambiental')
    } catch (_) {
      const d2 = new Record(docCol)
      d2.set('title', 'Licença Ambiental')
      d2.set('type', 'Licença')
      d2.set('status', 'validated')
      d2.set('urgency', 'medium')
      d2.set('unit', unit1Id)
      d2.set('due_date', new Date(Date.now() + 15 * 86400000).toISOString())
      d2.set('issue_date', new Date(Date.now() - 350 * 86400000).toISOString())
      app.save(d2)
    }

    try {
      app.findFirstRecordByData('documents', 'title', 'Certificado Conformidade Elevadores')
    } catch (_) {
      const d3 = new Record(docCol)
      d3.set('title', 'Certificado Conformidade Elevadores')
      d3.set('type', 'Certificado')
      d3.set('status', 'pending')
      d3.set('urgency', 'high')
      d3.set('unit', unit2Id)
      d3.set('due_date', new Date(Date.now() - 10 * 86400000).toISOString())
      d3.set('issue_date', new Date(Date.now() - 375 * 86400000).toISOString())
      app.save(d3)
    }
  },
  (app) => {
    // Optional cleanup
  },
)
