var fs = require('fs')
var hs = require('hyperstream')

module.exports = function (req, res) {
  res.writeHead(500, {'Content-Type': 'text/html'})
  fs.createReadStream(__dirname + '/../static/index.html').pipe(hs({
    '.main': 'Server Error'
  })).pipe(res)
}
