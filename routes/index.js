var api = require('../api')
var load = require('../lib/load')
var pile = require('pile')
var swap = require('swap')
var url = require('url')

module.exports = pile(
  load('layout.html'),
  load('brief.html'),
  load('results.html'),
  function (req, res, last) {
    var q = url.parse(req.url, true).query.q
    api.search(q, function (err, results) {
      if (err) return last(err)
      res.results = results
      last()
    })
  },
  function (req, res) {
    var results = []
    res.results.hits.hits.forEach(function (result) {
      results.push(swap(res.templates['brief.html'], result))
    })
    var main = swap(res.templates['results.html'], {results: results.join('')})
    res.send(swap(res.templates['layout.html'], {main: main, title: 'ADMIN'}))
  }
);
