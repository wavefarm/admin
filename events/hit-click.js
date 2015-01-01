var api = require('../api')


module.exports = function (ev) {
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return
  ev.preventDefault()
  api.get(ev.currentTarget.id, function (err, item) {
    if (err) return console.error(err)
    state.scrollX.set(window.scrollX)
    state.scrollY.set(window.scrollY)
    history.replaceState(state())
    state.archive.params.set(null)
    state.archive.results.set(null)
    state.archive.item.set(item)
    state.title.set(item.main)
    history.pushState(state(), '', '/' + item.id)
    window.scroll(0, 0)
  })
}
