var bookshelf = require('../config/bookshelf');

var Message = bookshelf.Model.extend({
  tableName: 'messages',
  message_to_user:function() {
    return this.hasOne(MessageToUser);
  }
});
module.exports = Message;