var h = require('virtual-dom/h')
var hitClick = require('../events/hit-click')


module.exports = function (item) {
  var desc = item.description || item.briefDescription || item.longDescription || ''
  // Strip HTML tags from description for excerpt display
  desc = desc.replace(/<[^>]*>/g, '')
  return h('.hit', [
    h('a.item-link#' + item.id, {
      href: '/' + item.id,
      'ev-click': hitClick
    }, [
      h('h3', [
        h('span.item-main', item.main),
        ' ',
        h('span.type', '(' + item.type + ')')
      ]),
      //h('.date', renderDate(item)),
      h('.credit', item.credit),
      h('.description', desc.length > 60 ? desc.substr(0, 60) + '...' : desc)
    ])
  ])
}
