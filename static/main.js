'use strict'

var qEl = document.getElementById('q')
var mainEl = document.getElementById('main')
var totalEl = document.getElementById('total')
var itemEl = document.getElementById('item')

function getItem (itemId, cb) {
  var url = 'http://api.wavefarm.org/' + itemId

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

  var url = 'http://api.wavefarm.org/search'
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
  var itemEl = document.createElement('a')
  mainEl.appendChild(itemEl)
  itemEl.className = 'item'

  var publicUrl = 'wavefarm.org/archive/' + item.id
  var publicLink = document.createElement('a')
  itemEl.appendChild(publicLink)
  if (!item.public) publicLink.style.display = 'none'
  publicLink.className = 'action public'
  publicLink.href = '//' + publicUrl
  publicLink.target = '_blank'
  publicLink.title = 'public location'
  publicLink.appendChild(document.createTextNode(publicUrl))

  var itemHeader = document.createElement('h3')
  itemEl.appendChild(itemHeader)
  var itemMain = document.createElement('span')
  itemHeader.appendChild(itemMain)
  itemMain.className = 'item-main'
  itemMain.appendChild(document.createTextNode(item.main))
  itemHeader.appendChild(document.createTextNode(' '))
  var itemType = document.createElement('span')
  itemHeader.appendChild(itemType)
  itemType.className = 'item-type'
  itemType.appendChild(document.createTextNode(item.type))

  var itemForm = document.createElement('form')
  itemEl.appendChild(itemForm)
  var itemPublic = document.createElement('input')
  itemForm.appendChild(itemPublic)
  itemPublic.id = 'public'
  itemPublic.name = 'public'
  itemPublic.type = 'checkbox'
  itemPublic.checked = item.public
  var itemPublicLabel = document.createElement('label')
  itemForm.appendChild(itemPublicLabel)
  itemPublicLabel.className = 'for-check'
  itemPublicLabel.htmlFor = 'active'
  itemPublicLabel.appendChild(document.createTextNode('public'))
  var itemSaveDelete = document.createElement('div')
  itemForm.appendChild(itemSaveDelete)
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
  var itemEl
  var itemHeader
  var itemMain
  var itemType
  var itemLen
  var i


  itemLen = items.length
  for (i=0; i < itemLen; i++) {
    item = items[i]
    desc = item.description || item.briefDescription || item.longDescription || ''

    // Strip HTML tags from description and truncate for excerpt
    desc = desc.replace(/<[^>]*>/g, '')
    desc = desc.length > 60 ? desc.substr(0, 60) + '...' : desc

    itemEl = document.createElement('a')
    itemEl.className = 'item'
    itemEl.id = item.id
    itemEl.href = '/' + item.id


    itemHeader = document.createElement('h3')
    itemMain = document.createElement('span')
    itemMain.className = 'item-main'
    itemMain.appendChild(document.createTextNode(item.main))
    itemHeader.appendChild(itemMain)
    itemHeader.appendChild(document.createTextNode(' '))
    itemType = document.createElement('span')
    itemType.className = 'item-type'
    itemType.appendChild(document.createTextNode(item.type))
    itemHeader.appendChild(itemType)
    itemEl.appendChild(itemHeader)

    itemCredit = document.createElement('div')
    itemCredit.className = 'credit'
    itemCredit.appendChild(document.createTextNode(item.credit || ''))
    itemEl.appendChild(itemCredit)

    itemDesc = document.createElement('div')
    itemDesc.className = 'description'
    itemDesc.appendChild(document.createTextNode(desc))
    itemEl.appendChild(itemDesc)

    mainEl.appendChild(itemEl)
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
