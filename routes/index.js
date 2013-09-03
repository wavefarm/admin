var api = require('../api')
var pile = require('pile')
var url = require('url')

module.exports = pile(
  function (req, res, next) {
    req.q = url.parse(req.url, true).query.q
    api.search(req.q, function (err, apiRes, results) {
      if (err) return next(err)
      res.results = results
      next()
    })
  },
  function (req, res) {
    res.render('results.html', {
      '.result': res.results.hits.map(function (hit) {
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
      }),
      '#count': res.results.total + ' results',
      '#q': {value: req.q}
    })
  }
)
