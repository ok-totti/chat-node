//upload

var fs;

fs = require('fs');

exports.post = function(req, res) {
  var target_path, tmp_path;
  tmp_path = req.files.thumbnail.path;
  target_path = './uploads/' + req.files.thumbnail.name;
  fs.rename(tmp_path, target_path, function(err) {
    if (err) {
      throw err;
    }
    fs.unlink(tmp_path, function() {
      if (err) {
        throw err;
      }
      res.send('File uploaded to: ' + target_path + ' - ' + req.files.thumbnail.size + ' bytes');
    });
  });
};

