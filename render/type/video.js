var h = require('hyperscript')
var rels = require('../widget/rels')

module.exports = function (item) {
  return [
    h('input#active', {name: 'active', type: 'checkbox', checked: item.active}),
    h('label.for-check', {htmlFor: 'active'}, 'public'),
    h('label', {'htmlFor': 'title'}, 'title'),
    h('input#title', {name: 'title', type: 'text', value: item.title || ''}),
    h('label', {'htmlFor': 'url'}, 'url'),
    h('input#url', {name: 'url', type: 'url', value: item.url || ''}),
    h('label', {'htmlFor': 'mimetype'}, 'mimetype'),
    h('input#mimetype', {name: 'mimetype', type: 'text', value: item.mimetype || ''}),
    h('label', {'htmlFor': 'date'}, 'date'),
    h('input#date', {name: 'date', type: 'date', value: item.date}),
    h('label', {'htmlFor': 'caption'}, 'caption'),
    h('input#caption', {name: 'caption', type: 'text', value: item.caption || ''}),
    h('label', {'htmlFor': 'description'}, 'description'),
    h('textarea#description', {name: 'description', rows: 8}, item.description),
    h('label', {'htmlFor': 'sites'}, 'sites'),
    h('input#sites', {name: 'sites', type: 'text', value: item.sites || ''}),
    h('label', {'htmlFor': 'artists'}, 'artists'),
    rels(item.artists),
    h('label', {'htmlFor': 'collaborators'}, 'collaborators'),
    rels(item.collaborators),
    h('label', {'htmlFor': 'works'}, 'works'),
    rels(item.works),
    h('label', {'htmlFor': 'events'}, 'events'),
    rels(item.events),
    h('label', {'htmlFor': 'shows'}, 'shows'),
    rels(item.shows),
  ]
}
