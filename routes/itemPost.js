var api = require('../api')
var fs = require('fs')

module.exports = function (req, res, next, id) {
  var item = JSON.parse(req.parsedBody.raw)
  api.put(id, item, function (err, apiRes, item) {
    if (err) return next(err)
    res.statusCode = 303
    res.setHeader('location', '/' + id)
    res.end()
  })
}
