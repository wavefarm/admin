var api = require('../api');
var fields = require('../fields');


module.exports = function (req, res) {
  api.schemas(function (err, apiRes, schemas) {
    if (err) return res.error(err);
    api.get(req.itemId, function (err, apiRes, item) {
      if (err) return res.error(err);
      if (apiRes.statusCode == 404) return res.notFound();
      var raw = JSON.stringify(item, null, 2);
      var schema = schemas[item.type];
      res.render('item.html', {
        title: item.main,
        '.item-id span': item.id,
        '.item-name': item.main,
        '.item-type span': item.type,
        '#raw': raw,
        'input[name=raw]': {value: raw},
        '.form-field': fields(item, schema)
      })
    })
  })
}
