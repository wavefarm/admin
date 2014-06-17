// Widget for linking to and managing relative items
var h = require('hyperscript')


function trunc (str) {
  str = str || ''
  if (str.length > 60) {
    str = str.substr(0, 60) + '...'
  }
  return str
}

module.exports = function (rels) {
  rels = rels || []
  return h('.rels',
    h('ul',
      rels.map(function (rel) {
        return h('li',
          h('a', {href: rel.id, target: '_blank'}, trunc(rel.main)),
          h('button.fa.fa-unlink', {title: 'unlink'})
        )
      })
    ),
    h('input', {type: 'text', autocomplete: 'off'}),
    h('button.fa.fa-link', {title: 'link'})
  )
}
