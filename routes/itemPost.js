var api = require('../api')
var fs = require('fs')
var scalpel = require('scalpel')
var stack = require('stack')

module.exports = stack(
  scalpel,
  function (req, res, next) {
    var id = req.params[0]
    var item = JSON.parse(req.parsedBody.raw)
    api.put(id, item, function (err, apiRes, item) {
      if (err) return next(err)
      res.statusCode = 303
      res.setHeader('location', '/' + id)
      res.end()
    })
  }
)
