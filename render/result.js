var h = require('hyperscript')

module.exports = function (item) {
  return h('.result', {'data-item': item},
    h('h2',
      h('a', {'href': '/' + item.id}, item.main)
    ),
    h('.type', item.type)
  )
}
