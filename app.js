var main = require('main-loop')
var render = require('./render')
var o = require('observ')
var os = require('observ-struct')


// THE STATE
var state = window.state = os({
  item: o(),
  params: o(),
  results: o(),
  schemas: o(),
  scrollX: o(),
  scrollY: o(),
  title: o()
})

var loop = main(state(), render, {
  initialTree: virtualize(target),
  target: target
})
state(loop.update)
state.title(function (c) {document.title = c})

