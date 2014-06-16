// Widget for linking to and managing relative items
var h = require('hyperscript')

module.exports = function (rels) {
  return h('.rels',
    h('ul',
      rels.map(function (rel) {
        return h('li',
          h('a.fa.fa-external-link', {href: rel.id, target: '_blank'},
            ' '+rel.main
          ),
          h('button.action.fa.fa-unlink', {title: 'unlink'})
        )
      })
    ),
    h('input', {type: 'text', autocomplete: 'off'}),
    h('button.action.fa.fa-link', {title: 'link'})
  )
}
