'use strict'

var qEl = document.getElementById('q')
var totalEl = document.getElementById('total')
var mainEl = document.getElementById('main')

function getItem (id, cb) {
  var url = '/api/' + id

  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4 || xhr.status != 200) return
    cb(JSON.parse(xhr.responseText))
  }
  xhr.open('GET', url)
  xhr.send()
}

function search (params, cb) {
  if (!cb) {
    cb = params
    params = null
  }

  var url = '/api/search'
  if (params) url += '?' + params

  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4 || xhr.status != 200) return
    cb(JSON.parse(xhr.responseText))
  }
  xhr.open('GET', url)
  xhr.send()
}

function renderFullItem (item) {
  var el = document.createElement('a')
  mainEl.appendChild(el)
  el.className = 'item'

  var publicUrl = 'wavefarm.org/archive/' + item.id
  var publicLink = document.createElement('a')
  el.appendChild(publicLink)
  if (!item.public) publicLink.style.display = 'none'
  publicLink.className = 'action public'
  publicLink.href = '//' + publicUrl
  publicLink.target = '_blank'
  publicLink.title = 'public location'
  publicLink.appendChild(document.createTextNode(publicUrl))

  var header = document.createElement('h3')
  el.appendChild(header)
  var main = document.createElement('span')
  header.appendChild(main)
  main.className = 'item-main'
  main.appendChild(document.createTextNode(item.main))
  header.appendChild(document.createTextNode(' '))
  var type = document.createElement('span')
  header.appendChild(type)
  type.className = 'item-type'
  type.appendChild(document.createTextNode(item.type))

  var form = document.createElement('form')
  el.appendChild(form)

  function renderInput (name, type) {
    var label = document.createElement('label')
    form.appendChild(label)
    label.htmlFor = name
    label.appendChild(document.createTextNode(name))
  
    var input = document.createElement('input')
    form.appendChild(input)
    input.id = name
    input.name = name
    input.type = type || name
    input.value = item[name] || ''
  }

  var publicInput = document.createElement('input')
  form.appendChild(publicInput)
  publicInput.id = 'public'
  publicInput.name = 'public'
  publicInput.type = 'checkbox'
  publicInput.checked = item.public
  var publicLabel = document.createElement('label')
  form.appendChild(publicLabel)
  publicLabel.className = 'for-check'
  publicLabel.htmlFor = 'active'
  publicLabel.appendChild(document.createTextNode('public'))

  if (item.type == 'show') {
    renderInput('title', 'text')
    renderInput('url')
    renderInput('mimetype', 'text')
    renderInput('date')
    renderInput('caption', 'text')
    renderInput('description', 'textarea')
    renderInput('sites')
    renderInput('artists', 'rels')
    renderInput('collaborators', 'rels')
    renderInput('works', 'rels')
    renderInput('events', 'rels')
    renderInput('shows', 'rels')
  }

  var itemSaveDelete = document.createElement('div')
  form.appendChild(itemSaveDelete)
  itemSaveDelete.className = 'save-delete'
  var itemSave = document.createElement('input')
  itemSaveDelete.appendChild(itemSave)
  itemSave.className = 'action'
  itemSave.type = 'submit'
  itemSave.value = 'save'
  var itemDelete = document.createElement('input')
  itemSaveDelete.appendChild(itemDelete)
  itemDelete.type = 'button'
  itemDelete.className = 'action'
  itemDelete.value = 'delete'
}

function renderItems (items) {
  var desc
  var item
  var itemCredit
  var itemDesc
  var el
  var header
  var main
  var type
  var itemLen
  var i


  itemLen = items.length
  for (i=0; i < itemLen; i++) {
    item = items[i]
    desc = item.description || item.briefDescription || item.longDescription || ''

    // Strip HTML tags from description and truncate for excerpt
    desc = desc.replace(/<[^>]*>/g, '')
    desc = desc.length > 60 ? desc.substr(0, 60) + '...' : desc

    el = document.createElement('a')
    el.className = 'item'
    el.id = item.id
    el.href = '/' + item.id


    header = document.createElement('h3')
    main = document.createElement('span')
    main.className = 'item-main'
    main.appendChild(document.createTextNode(item.main))
    header.appendChild(main)
    header.appendChild(document.createTextNode(' '))
    type = document.createElement('span')
    type.className = 'item-type'
    type.appendChild(document.createTextNode(item.type))
    header.appendChild(type)
    el.appendChild(header)

    itemCredit = document.createElement('div')
    itemCredit.className = 'credit'
    itemCredit.appendChild(document.createTextNode(item.credit || ''))
    el.appendChild(itemCredit)

    itemDesc = document.createElement('div')
    itemDesc.className = 'description'
    itemDesc.appendChild(document.createTextNode(desc))
    el.appendChild(itemDesc)

    mainEl.appendChild(el)
  }
}

function initialize () {
  var initialParams
  var initialParamsParsed
  var itemId = /\w{6}/.exec(window.location.pathname)
  if (itemId) {
    getItem(itemId, function (item) {
      renderFullItem(item)
    })
  } else {
    initialParams = window.location.search.substr(1)
    initialParamsParsed = queryString.parse(initialParams)

    qEl.value = initialParamsParsed.q || ''
    search(initialParams, function (data) {
      totalEl.textContent = totalEl.innerText = data.total
      renderItems(data.hits)
    })
  }
}

initialize()
