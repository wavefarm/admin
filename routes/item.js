var api = require('../api');
var fields = require('../fields');
var hs = require('hyperstream')
var render = require('../render');
var t = require('../templates')


module.exports = function (req, res) {
  api.get(req.itemId, function (err, apiRes, item) {
    if (err) return res.error(err);
    if (apiRes.statusCode == 404) return res.notFound();
    var template = t(item.type + '.html')
    t('layout.html').pipe(hs({
      'title': item.main,
      '.main': render(template, item),
      '.raw': JSON.stringify(item, null, 2)
    })).pipe(res)

    //res.render('item.html', {
    //  title: item.main,
    //  '.item-id span': item.id,
    //  '.item-name': item.main,
    //  '.item-type span': item.type,
    //  '#raw': raw,
    //  'input[name=raw]': {value: raw},
    //  '.form-field': fields(item, schema)
    //})
  })
}
