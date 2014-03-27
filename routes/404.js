var fs = require('fs')
var hs = require('hyperstream')

module.exports = function (req, res) {
  res.statusCode = 404;
  fs.createReadStream(__dirname + '/../static/index.html').pipe(hs({
    '.main': 'Not Found'
  })).pipe(res)
}
