var fs = require('fs')


var html = __dirname + '/../static/index.html'

module.exports = function (req, res) {
  fs.stat(html, function (err, stats) {
    var tag = '"' + stats.dev + '-' + stats.ino + '-' + stats.mtime.getTime() + '"'
    if (req.headers['if-none-match'] === tag) {
      res.statusCode = 304
      res.end()
    }
    else {
      res.statusCode = 200
      res.setHeader('content-type', 'text/html')
      res.setHeader('etag', tag)
      fs.createReadStream(html).pipe(res)
    }
  })
}

    //res.render('item.html', {
    //  title: item.main,
    //  '.item-id span': item.id,
    //  '.item-name': item.main,
    //  '.item-type span': item.type,
    //  '#raw': raw,
    //  'input[name=raw]': {value: raw},
    //  '.form-field': fields(item, schema)
    //})
