var h = require('hyperscript')
var rels = require('../widget/rels')

module.exports = function (item) {
  return [
    h('input#active', {name: 'active', type: 'checkbox', checked: item.active}),
    h('label.for-check', {htmlFor: 'active'}, 'public'),
    h('label', {'htmlFor': 'name'}, 'name'),
    h('input#name', {name: 'name', type: 'text', value: item.name || ''}),
    h('label', {'htmlFor': 'sortName'}, 'sort name'),
    h('input#sortName', {name: 'sortName', type: 'text', value: item.sortName || ''}),
    h('label', {'htmlFor': 'portrait'}, 'portrait'),
    h('input#portrait', {name: 'portrait', type: 'text', value: item.portrait || ''}),
    h('label', {'htmlFor': 'bio'}, 'bio'),
    h('textarea#bio', {name: 'bio', rows: 8}, item.bio),
    h('label', {'htmlFor': 'url'}, 'url'),
    h('input#url', {name: 'url', type: 'text', value: item.url || ''}),
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
    h('label', {'htmlFor': 'audio'}, 'audio'),
    rels(item.audio),
    h('label', {'htmlFor': 'video'}, 'video'),
    rels(item.video),
    h('label', {'htmlFor': 'image'}, 'image'),
    rels(item.image),
    h('label', {'htmlFor': 'text'}, 'text'),
    rels(item.text),
  ]
}
