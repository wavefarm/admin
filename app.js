var api = require('./api')
var main = require('main-loop')
var render = require('./render')
var o = require('observ')
var os = require('observ-struct')
var virtualize = require('vdom-virtualize')


// Start the delegator
require('dom-delegator')()

// THE STATE
var state = window.state = os({
  item: o(),
  params: o(),
  results: o(),
  schemas: o(),
  scroll: o(),
  title: o()
})

var target = document.body
var loop = main(state(), render, {
  create: require('virtual-dom/create-element'),
  diff: require('virtual-dom/diff'),
  patch: require('virtual-dom/patch'),
  initialTree: virtualize(target),
  target: target
})
state(loop.update)
state.title(function (c) {document.title = c})

api.search({}, function (err, results) {
  if (err) return console.error(err)
  state.results.set(results)
  history.replaceState(state())
})
