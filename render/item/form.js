var h = require('hyperscript')


// Need map because browserify can't handle dynamic requires
var renderMap = {
  audio: require('../type/audio'),
  broadcast: require('../type/broadcast'),
  show: require('../type/show'),
  text: require('../type/text'),
}

module.exports = function (item) {
  return [
    h('ul.links',
      h('a.action', {href: 'http://wavefarm.org/archive/'+item.id, target: '_blank'},
        h('li.fa.fa-external-link', ' wavefarm.org/archive/'+item.id)
      )
      //item.sites.map(function (site) {
      //})
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
