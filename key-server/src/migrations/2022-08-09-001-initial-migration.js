
exports.up = async knex => {
  await knex.schema.createTable('key', table => {
    table.increments('keyID')
    table.string('songURL')
    table.string('value')
  })
  await knex.schema.createTable('invoice', table => {
    table.increments('invoiceID')
    table.string('orderID')
    table.string('paymail')
    table.string('identityKey')
    table.string('referenceNumber').unique()
    table.integer('keyID').unsigned().references('keyID').inTable('key')
    table.integer('amount')
    table.boolean('processed')
  })
}

exports.down = async knex => {
  await knex.schema.dropTable('key')
  await knex.schema.dropTable('invoice')
}
