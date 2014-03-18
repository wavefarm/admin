var api = require('../api')
var url = require('url')

module.exports = function (req, res) {
  var q = url.parse(req.url, true).query.q
  api.search(q, function (err, apiRes, results) {
    if (err) return next(err)
    var result = [];
    if (!results.hits) {
      console.warn('Warning: No hits');
      console.warn(results);
    } else {
      result = results.hits.map(function (hit) {
        var data = {
          '.main a': {
            href: '/' + hit.id,
            _text: hit.main + ' (' + hit.type + ')'
          }
        }
        var fields = []
        for (var field in hit) {
          var value = hit[field]
          if (['id', 'main', 'type'].indexOf(field) != -1) continue
          if (typeof value != 'string') continue
          if (value.length > 60) value = value.substr(0, 60) + '...'
          fields.push({
            '.name': field, 
            '.value': value
          })
        }
        data['.field'] = fields
        return data
      });
    }
    res.render('results.html', {
      '.result': result,
      '#count': results.total + ' results',
      '#q': {value: q}
    })
  })
}
