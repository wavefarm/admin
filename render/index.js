var h = require('virtual-dom/h')
var renderHit = require('./hit')
var search = require('../events/search')


module.exports = function (state) {
  var params = state && state.params || {}
  var results = state && state.results
  var hitCount = (results && results.hits && results.hits.length) || 0
  var total = results && results.total || 0
  return h('body', [
    h('header', [
      h('a', {href: '/'}, [
        h('h1.logo', 'admin')
      ])
    ]),
    h('.controls', [
      h('form.search', {'ev-submit': search}, [
        h('input#q', {name: 'q', type: 'search', placeholder: 'search'})
      ]),
      h('.count', [
        h('span.total'),
        h('span', ' results')
      ])
    ]),
    hitCount ? h('.main', results.hits.map(renderHit)) : ''
  ])
}
