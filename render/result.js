var h = require('hyperscript')

module.exports = function (item) {
  return h('.result', {'id': item.id, 'data-item': JSON.stringify(item)},
    h('a', {'href': '/' + item.id}, 
      h('span.item-main', item.main),
      ' ',
      h('span.type', '(' + item.type + ')')
    )
  )
}
