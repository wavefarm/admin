var fs = require('fs')
var hs = require('hyperstream')

module.exports = function (req, res) {
  res.writeHead(404, {'Content-Type': 'text/html'})
  fs.createReadStream(__dirname + '/../static/index.html').pipe(hs({
    '.main': 'Not Found'
  })).pipe(res)
}
