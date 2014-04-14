var h = require('hyperscript')

module.exports = function (item) {
  return h('form',
    h('label', {'for': 'title'}, 'title'),
    h('input#title', {name: 'title', type: 'text', value: item.title}),
    h('label', {'for': 'mimetype'}, 'mimetype'),
    h('input#mimetype', {name: 'mimetype', type: 'text', value: item.mimetype}),
    h('label', {'for': 'url'}, 'url'),
    h('input#url', {name: 'url', type: 'url', value: item.url})
  )
}
