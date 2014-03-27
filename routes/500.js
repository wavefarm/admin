var fs = require('fs')
var hs = require('hyperstream')

module.exports = function (req, res) {
  res.statusCode = 500
  fs.createReadStream(__dirname + '/../static/index.html').pipe(hs({
    '.main': 'Server Error'
  })).pipe(res)
}
