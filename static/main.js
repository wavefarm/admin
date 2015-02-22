/* global setCookie,getCookie,dropCookie,queryString */
'use strict'

var cache = {
  el: {
    count: document.getElementById('count'),
    main: document.getElementById('main'),
    user: document.getElementById('user'),
    search: document.getElementById('search'),
    types: document.getElementById('types')
  }
}

cache.token = getCookie('token')

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
  cache.el.main.appendChild(el)
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

    cache.el.main.appendChild(el)
  }
}

function renderTypes (data) {
  var typeDiv
  for (var t in data) {
    typeDiv = document.createElement('a')
    typeDiv.href = '?q=type:' + t
    typeDiv.appendChild(document.createTextNode(t))
    cache.el.types.appendChild(typeDiv)
    cache.el.types.appendChild(document.createTextNode(' '))
  }
}

function renderLogin () {
  var elem
  for (var e in cache.el) {
    elem = cache.el[e]
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem)
    }
  }

  cache.el.login = cache.el.login || document.getElementById('login')
  if (!cache.el.login.parentNode) {document.body.appendChild(cache.el.login)}

  var userInput = renderInput(cache.el.login, 'username', '', 'text')
  var passInput = renderInput(cache.el.login, 'password')

  var loginSubmit = document.createElement('input')
  loginSubmit.className = 'submit'
  loginSubmit.type = 'submit'
  loginSubmit.value = 'login'
  cache.el.login.appendChild(loginSubmit)

  cache.el.login.addEventListener('submit', function (e) {
    e.preventDefault()
    loginSubmit.disabled = true
    if (cache.errDiv && cache.errDiv.parentNode) cache.el.login.removeChild(cache.errDiv)
    api('POST', 'login', {username: userInput.value, password: passInput.value}, function (err, user) {
      loginSubmit.disabled = false
      if (err) {
        if (!cache.errDiv) {
          cache.errDiv = document.createElement('div')
          cache.errDiv.className = 'alert'
          cache.errDiv.appendChild(document.createTextNode('No user found with those credentials.'))
        }
        return cache.el.login.appendChild(cache.errDiv)
      }
      if (cache.errDiv && cache.errDiv.parentNode) cache.el.login.removeChild(cache.errDiv)
      setCookie('token', user.token, 100)
      setCookie('username', user.name, 100)
      setCookie('userid', user.id, 100)
      cache.el.login.parentNode.removeChild(cache.el.login)
      populate()
    })
  })
}

function renderSearch (params) {
  var searchInput = document.createElement('input')
  searchInput.id = 'q'
  searchInput.name = 'q'
  searchInput.type = 'search'
  searchInput.placeholder = 'search'
  searchInput.value = queryString.parse(params).q || ''
  cache.el.search.appendChild(searchInput)
}

function renderCount (total) {
  var totalSpan = document.createElement('span')
  totalSpan.id = 'total'
  totalSpan.appendChild(document.createTextNode(total))
  cache.el.count.appendChild(totalSpan)
  cache.el.count.appendChild(document.createTextNode(' results'))
}

function renderUser () {
  if (!cache.el.user.parentNode) {
    cache.el.user.firstChild.textContent = getCookie('username')
    cache.el.user.firstChild.href = getCookie('userid')
    var header = document.getElementsByTagName('header')[0]
    header.insertBefore(cache.el.user, header.firstChild)
    return
  }

  var nameLink = document.createElement('a')
  nameLink.className = 'username'
  nameLink.href = getCookie('userid')
  nameLink.appendChild(document.createTextNode(getCookie('username')))
  cache.el.user.appendChild(nameLink)

  cache.el.user.appendChild(document.createTextNode(' '))

  var logoutLink = document.createElement('a')
  logoutLink.className = 'logout'
  logoutLink.href = ''
  logoutLink.appendChild(document.createTextNode('logout'))
  cache.el.user.appendChild(logoutLink)

  logoutLink.addEventListener('click', function (e) {
    e.preventDefault()
    dropCookie('token')
    renderLogin()
  })
}

function populate () {
  var itemId = /\w{6}/.exec(window.location.pathname)
  var params = window.location.search.substr(1)

  renderUser()

  api('GET', 'schemas', function (err, data) {renderTypes(data)})
  renderSearch(params)

  if (itemId) {
    api('GET', itemId, function (err, item) {renderItem(item)})
  } else {
    api('GET', 'search?' + params, function (err, data) {
      if (err) console.error(err)
      renderCount(data.total)
      renderResults(data.hits)
    })
  }
}

function initialize () {
  if (!cache.token) return renderLogin()
  populate()
}

initialize()
