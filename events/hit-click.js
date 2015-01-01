var api = require('../api')


module.exports = function (ev) {
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return
  ev.preventDefault()
  api.get(ev.currentTarget.id, function (err, item) {
    if (err) return console.error(err)
    state.scroll.set({x: window.scrollX, y: window.scrollY})
    history.replaceState(state())
    state.params.set(null)
    state.results.set(null)
    state.item.set(item)
    state.title.set(item.main)
    history.pushState(state(), '', '/' + item.id)
    window.scroll(0, 0)
  })
}
