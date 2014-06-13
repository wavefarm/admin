var h = require('hyperscript')

module.exports = function (item) {
  return h('x-result', {'id': item.id, 'data-item': JSON.stringify(item)}, item.main)
}
