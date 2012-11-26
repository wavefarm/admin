//var db = require('./db')
var load = require('../lib/load')
var pile = require('pile')
var swap = require('swap')
var url = require('url')

module.exports = pile(
  load('layout.html'),
  load('brief.html'),
  load('results.html'),
  function (req, res, last) {
    //var query = url.parse(req.url, true).query
    //var q = query && query.q
    //db.search(q, function (err, results) {
    //  if (err) return last(err)
    //  res.results = results
    //  last()
    //})
    res.results = [
      {id: '123', name: 'Sue', type: 'western'},
      {id: '124', name: 'JR', type: 'cool'},
      {id: '126', name: 'Nan', type: 'western'}
    ]
    last()
  },
  function (req, res) {
    var results = []
    res.results.forEach(function (result) {
      results.push(swap(res.templates['brief.html'], result))
    })
    var main = swap(res.templates['results.html'], {results: results.join('')})
    res.send(swap(res.templates['layout.html'], {main: main}))
  }
);
