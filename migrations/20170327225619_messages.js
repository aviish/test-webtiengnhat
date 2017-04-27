
exports.up = function(knex, Promise) {
    return  knex.schema.createTableIfNotExists('messages', function(table) {
            table.bigIncrements('id').primary();
            table.string('content');
            table.tinyint('is_public');
            table.string('sender_name');
            table.timestamps();
            }) .createTableIfNotExists('message_to_user', function(table) {
            table.bigIncrements('id').primary();
            table.string('receive_name');
            table.bigInteger('message_id').unique();
          });
};

exports.down = function(knex, Promise) {
   return knex.schema.dropTable('messages')
          .dropTable('message_to_user')
};
