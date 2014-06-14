var h = require('hyperscript')


// Need map because browserify can't handle dynamic requires
var renderMap = {
  text: require('../type/text'),
}

module.exports = function (item) {
  return [
    h('h3',
      h('span.item-main', item.main),
      ' ',
      h('span.item-type', '(' + item.type + ')')
    ),
    h('form',
      renderMap[item.type](item),
      h('input', {type: 'submit', value: 'save'})
    )
  ]
}
