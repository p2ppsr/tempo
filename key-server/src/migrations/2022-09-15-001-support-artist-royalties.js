
exports.up = async knex => {
  await knex.schema.createTable('outgoingRoyaltyPayment', table => {
    table.increments('Id')
    table.timestamps()
    table.text('transaction', 'longtext')
    table.string('derivationPrefix', 64)
    table.string('derivationSuffix', 64)
    table.bigInteger('amount')
  })
  await knex.schema.createTable('royalty', table => {
    table.increments('Id')
    table.timestamps()
    table.integer('keyID').unsigned().references('keyID').inTable('key')
    table.string('artistIdentityKey')
    table.integer('amount', 15)
    table.boolean('paid')
    table.integer('paymentId').unsigned().references('Id').inTable('outgoingRoyaltyPayment')
  })
  // Add an artistIdentityKey column to keep track of who owns this song
  await knex.schema.table('key', table => {
    table.string('artistIdentityKey')
  })
}

exports.down = async knex => {
  await knex.schema.table('key', table => {
    table.dropColumn('artistIdentityKey')
  })
  await knex.schema.dropTable('royalty')
  await knex.schema.dropTable('outgoingRoyaltyPayment')
}
