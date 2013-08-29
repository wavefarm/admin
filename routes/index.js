var api = require('../api')
var glue = require('../glue')
var pile = require('pile')
var url = require('url')

function truncate (text) {
  if (text.length > 60) {
    text = text.substr(0, 60) + '...'
  }
  return text
}

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
          if (['id', 'main', 'type'].indexOf(field) != -1) continue
          if (typeof hit[field] != 'string') continue
          fields.push({
            '.name': field, 
            '.value': truncate(hit[field])
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
