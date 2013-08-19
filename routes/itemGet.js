var api = require('../api')
var fs = require('fs')

module.exports = function (req, res, next, id) {
  api.get(id, function (err, apiRes, item) {
    if (err) return next(err)
    if (apiRes.statusCode == 404) return next()
    data = {
      '.item-name': item.main,
      '.raw': JSON.stringify(item, null, 2)
    }
    res.render({
      title: item.main,
      '#main': {
        _html: res.glue('item.html', data)
      }
    })
  })
}
