/* global getCookie,queryString */
'use strict'

var mainEl = document.getElementById('main')
  
function api (method, path, data, cb) {
  if (!cb) {
    cb = data
    data = {}
  }

  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState != 4) return
    var data = JSON.parse(xhr.responseText)
    if (xhr.status != 200) {
      return cb({status: xhr.status, message: data.message})
    }
    cb(null, data)
  }
  xhr.open(method, '/api/' + path)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.send(JSON.stringify(data))
}

function renderInput (form, name, value, type) {
  var label = document.createElement('label')
  form.appendChild(label)
  label.htmlFor = name
  label.appendChild(document.createTextNode(name))

  var input = document.createElement('input')
  form.appendChild(input)
  input.id = name
  input.name = name
  input.value = value || ''
  input.type = type || name

  return input
}

function renderItem (item) {
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
    renderInput(form, 'title', item.title, 'text')
    renderInput(form, 'url', item.url)
    renderInput(form, 'mimetype', item.mimetype, 'text')
    renderInput(form, 'date', item.date)
    renderInput(form, 'caption', item.caption, 'text')
    renderInput(form, 'description', item.description, 'textarea')
    renderInput(form, 'sites', item.sites)
    renderInput(form, 'artists', item.artists, 'rels')
    renderInput(form, 'collaborators', item.collaborators, 'rels')
    renderInput(form, 'works', item.works, 'rels')
    renderInput(form, 'events', item.events, 'rels')
    renderInput(form, 'shows', item.shows, 'rels')
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

function renderResults (items) {
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
    el.href = item.id

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

function renderTypes (data) {
  var typeEl
  var typesEl = document.getElementById('types')

  for (var t in data) {
    typeEl = document.createElement('a')
    typeEl.href = '?q=type:' + t
    typeEl.appendChild(document.createTextNode(t))
    typesEl.appendChild(typeEl)
    typesEl.appendChild(document.createTextNode(' '))
  }
}

var errDiv
function renderLogin () {
  var loginForm = document.getElementById('login')

  var userInput = renderInput(loginForm, 'username', '', 'text')
  var passInput = renderInput(loginForm, 'password')

  var loginSubmit = document.createElement('input')
  loginSubmit.className = 'submit'
  loginSubmit.type = 'submit'
  loginSubmit.value = 'login'
  loginForm.appendChild(loginSubmit)

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault()
    loginSubmit.disabled = true
    if (errDiv && errDiv.parentNode) loginForm.removeChild(errDiv)
    api('POST', 'login', {username: userInput.value, password: passInput.value}, function (err, data) {
      loginSubmit.disabled = false
      if (err) {
        if (!errDiv) {
          errDiv = document.createElement('div')
          errDiv.className = 'alert'
          errDiv.appendChild(document.createTextNode('No user found with those credentials.'))
        }
        return loginForm.appendChild(errDiv)
      }
      if (errDiv && errDiv.parentNode) loginForm.removeChild(errDiv)
      console.log(data.user)
    })
  })
}

function renderSearch (params) {
  var searchForm = document.getElementById('search')
  var searchInput = document.createElement('input')
  searchInput.id = 'q'
  searchInput.name = 'q'
  searchInput.type = 'search'
  searchInput.placeholder = 'search'
  searchInput.value = queryString.parse(params).q || ''
  searchForm.appendChild(searchInput)
}

function renderCount (total) {
  var countDiv = document.getElementById('count')
  var totalSpan = document.createElement('span')
  totalSpan.id = 'total'
  totalSpan.appendChild(document.createTextNode(total))
  countDiv.appendChild(totalSpan)
  countDiv.appendChild(document.createTextNode(' results'))
}

function populate () {
  var itemId = /\w{6}/.exec(window.location.pathname)
  var params = window.location.search.substr(1)

  api('GET', 'schemas', function (data) {renderTypes(data)})
  renderSearch(params)

  if (itemId) {
    api('GET', itemId, function (item) {renderItem(item)})
  } else {
    api('GET', 'search?' + params, function (data) {
      renderCount(data.total)
      renderResults(data.hits)
    })
  }
}

function initialize () {
  // If no token cookie short circuit to login
  if (!getCookie('token')) return renderLogin()
  populate()
}

initialize()
