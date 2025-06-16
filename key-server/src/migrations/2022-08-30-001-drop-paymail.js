
exports.up = async knex => {
  await knex.schema.table('invoice', table => {
    table.dropColumn('paymail')
  })
}

exports.down = async knex => {
  await knex.schema.table('invoice', table => {
    table.string('paymail')
  })
}
