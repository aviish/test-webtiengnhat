var bookshelf = require('../config/bookshelf');

var MessageToUser = bookshelf.Model.extend({
  tableName: 'message_to_user',
  Messages :function() {
      return this.belongsTo(Message);
  }
});
module.exports = MessageToUser;