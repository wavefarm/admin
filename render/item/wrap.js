var h = require('hyperscript')

module.exports = function (item) {
  return h('.item#'+item.id, {'data-item': JSON.stringify(item)})
}
