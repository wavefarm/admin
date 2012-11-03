var fs = require('fs')
var pile = require('pile')
var swap = require('swap')

module.exports = pile(
  load('layout'),
  load('index'),
  load('results'),
  load('result'),
  function (req, res, last) {
    // TODO fetch results from ES
    res.data.results = [
      {id: '123', name: 'Sue', type: 'western'},
      {id: '124', name: 'JR', type: 'cool'},
      {id: '125', name: 'Nan', type: 'western'}
    ]
    last()
  },
  function (req, res, next) {
    var results = ''
    res.data.results.forEach(function (result) {
      results += swap(res.html.result, result)
    })
    var content = swap(res.html.results, {results: results})
    var main = swap(res.html.index, {content: content})
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(swap(res.html.layout, {main: main}))
  }
);

function load (name) {
  return function (req, res, next) {
    fs.readFile('static/templates/'+name+'.html', 'utf8', function (err, template) {
      if (err) return next(err)
      res.html[name] = template
      next()
    })
  }
}
