var api = require('../api');
var fields = require('../fields');


module.exports = function (req, res, next, id) {
  api.get(id, function (err, apiRes, item) {
    if (err) return next(err)
    if (apiRes.statusCode == 404) return next()
    var schema = req.schemas[item.type];
    res.render('item.html', {
      title: item.main,
      '.item-id span': item.id,
      '.item-name': item.main,
      '.item-type span': item.type,
      '#raw': JSON.stringify(item, null, 2),
      '.form-field': fields(item, schema)
    })
  })
}
