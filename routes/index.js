var api = require('../api')
var load = require('../lib/load')
var pile = require('pile')
var swap = require('swap')
var truncate = require('html-truncate')
var url = require('url')

module.exports = pile(
  load('layout.html'),
  load('brief.html'),
  load('results.html'),
  load('field.html'),
  function (req, res, last) {
    var q = url.parse(req.url, true).query.q
    api.search(q, function (err, results) {
      if (err) return last(err)
      res.results = results
      last()
    })
  },
  function (req, res) {
    res.send(swap(res.templates['layout.html'], {
      main: swap(res.templates['results.html'], {
        count: '1-10',
        results: res.results.hits.map(function (hit) {
          var fields = []
          for (var field in hit) {
            if (['id', 'main', 'type'].indexOf(field) != -1) continue
            if (typeof hit[field] != 'string') continue
            fields.push(swap(res.templates['field.html'], {
              field: field, 
              value: truncate(hit[field], 40)
            }))
          }
          var brief = {
            id: hit.id,
            main: hit.main,
            type: hit.type,
            fields: fields.join('')
          }
          return swap(res.templates['brief.html'], brief)
        }).join(''),
        total: res.results.total
      }),
      title: 'ADMIN'
    }))
  }
);
