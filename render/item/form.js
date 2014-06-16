var h = require('hyperscript')


// Need map because browserify can't handle dynamic requires
var renderMap = {
  audio: require('../type/audio'),
  broadcast: require('../type/broadcast'),
  show: require('../type/show'),
  text: require('../type/text'),
}

module.exports = function (item) {
  var url, elems = []
  url = 'wavefarm.org/archive/'+item.id
  if (item.type == 'broadcast' && item.categories.indexOf(18) != -1) {
    url = 'wavefarm.org/wgxc/schedule/'+item.id
  }
  return [
    h('a.action.public',
      {href: '//'+url, target: '_blank', title: 'public location'},
      url
    ),
    h('h3',
      h('span.item-main', item.main),
      ' ',
      h('span.item-type', '(' + item.type + ')')
    ),
    h('form',
      renderMap[item.type](item),
      h('.crud',
        h('input.action', {type: 'submit', value: 'save'}),
        h('input.action', {type: 'button', value: 'delete'})
      )
    ),
  ]
}
