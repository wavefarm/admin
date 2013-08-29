var api = require('../api')
var fs = require('fs')

module.exports = function (req, res, next, id) {
  api.get(id, function (err, apiRes, item) {
    if (err) return next(err)
    if (apiRes.statusCode == 404) return next()
    res.render('item.html', {
      title: item.main,
      '.item-name': item.main,
      '.raw': JSON.stringify(item, null, 2)
    })
  })
}
