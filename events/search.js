var api = require('../api')
var qs = require('querystring')
var valueEvent = require('value-event/value')


module.exports = valueEvent(function (params) {
  var state = window.state

  state.params.set(params)
  state.title.set('Search' + (params.q ? ' for ' + params.q : ''))

  api.search(params, function (err, results) {
    if (err) return console.error(err)
    state.results.set(results)
    state.item.set(null)
    history.pushState(state(), '', '/?' + qs.stringify(params))
  })
})
