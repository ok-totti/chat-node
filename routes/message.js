var mongoose = require('mongoose');
var dateformat = require('dateformat');
var mongoosePaginate = require('mongoose-paginate');

// Default Schemaを取得
var Schema = mongoose.Schema;

// Defaultのスキーマから新しいスキーマを定義
var MsSchema = new Schema({
   type: String,
   user: String,
   text: String,
   img: String,
   time: String,
});

var MsSchema2 = new Schema({
   name: String,
   pass: String,
});

//ページネーション設定
MsSchema.plugin(mongoosePaginate);

// モデル化。model('[登録名]', '定義したスキーマクラス')
mongoose.model('Message', MsSchema);
mongoose.model('User', MsSchema2);
var Message = mongoose.model('Message');
var User = mongoose.model('User');

//exportしておく
exports.module = Message
exports.module = User

// mongodb://[hostname]/[dbname]
mongoose.connect('mongodb://localhost/message_db');


//typeがchatのデータを取得するfunction
exports.find = function(req, res) {
if (req.query.page){
  paging = req.query.page
}else{
  paging = 1
}
console.log(paging)

Message.paginate( {"type" : "chat" },{ page: paging, limit: 5, sortBy: { "time": -1 }}, function(err, message, pageCount, itemCount) {
    if (err) {
      console.log('An error has occurred');
    } else {
      res.render('chat', {
        title : 'Chat',
        username : req.body.username,
        message : message,
        pageCount: pageCount,
        itemCount: itemCount,
        pre: parseInt(paging) - 1,
        nex: parseInt(paging) + 1,
        username: req.session.user
    });
  }
});
}

//データを保存するfunction
exports.save = function(data) {
  var message = new Message();
  message.type  = data.type;
  message.user = data.user;
  message.text = data.value;
  message.img = data.img;
  message.time = dateformat(new Date(), 'yyyy-mm-dd HH:MM:ss');
  message.save(function(err) {
    if (err) { console.log(err); }
  });
}

//ユーザーデータを保存するfunction
exports.user = function(req, res) {
  User.find({name: new RegExp(req.body.username, "i")}, function(err, results) {
    if (err) {
      console.log('An error has occurred');
    } else if (results != ""){
      console.log(results);
      res("1");
    } else {
      var user = new User();
      user.name  = req.body.username;
      user.pass = req.body.pass;
      user.save(function(er) {
        if (er) { console.log(er); }
      });
      res("0");
    }
});
}

//検索するfunction
exports.search = function(callback, query) {
  Message.find({text: new RegExp(query, "i")}, function(err, results) {
    if (err) {
      console.log('An error has occurred');
    } else {
      callback(results);
    }
});
}