var h = require('hyperscript')

module.exports = function (item) {
  return [
    h('label', {'htmlFor': 'title'}, 'title'),
    h('input#title', {name: 'title', type: 'text', value: item.title}),
    h('label', {'htmlFor': 'mimetype'}, 'mimetype'),
    h('input#mimetype', {name: 'mimetype', type: 'text', value: item.mimetype}),
    h('label', {'htmlFor': 'url'}, 'url'),
    h('input#url', {name: 'url', type: 'url', value: item.url})
  ]
}
