var h = require('hyperscript')

module.exports = function (item) {
  return h('.result', {'id': item.id, 'data-item': JSON.stringify(item)},
    h('h2',
      h('a', {'href': '/' + item.id}, item.main),
      ' ',
      h('span.type', '(' + item.type + ')')
    )
  )
}
