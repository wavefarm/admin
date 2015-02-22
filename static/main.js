/* global setCookie,getCookie,dropCookie,queryString */
'use strict'

var cache = {
  count: document.getElementById('count'),
  login: document.getElementById('login'),
  main: document.getElementById('main'),
  user: document.getElementById('user'),
  search: document.getElementById('search'),
  token: getCookie('token'),
  types: document.getElementById('types')
}


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

function fieldFactory (form) {
  return function (name, value, type) {
    form.appendChild(renderLabel(name))
    form.appendChild(renderInput(name, value, type))
  }
}

function renderLabel (name) {
  var label = document.createElement('label')
  label.htmlFor = name
  label.appendChild(document.createTextNode(name))
  return label
}

function renderInput (name, value, type) {
  var input = document.createElement('input')
  input.id = name
  input.name = name
  input.value = value || ''
  input.type = type || name
  return input
}

function renderItem (item) {
  var el = document.createElement('a')
  cache.main.appendChild(el)
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

  var field = fieldFactory(form)

  if (item.type == 'show') {
    field('title', item.title, 'text')
    field('url', item.url)
    field('mimetype', item.mimetype, 'text')
    field('date', item.date)
    field('caption', item.caption, 'text')
    field('description', item.description, 'textarea')
    field('sites', item.sites)
    field('artists', item.artists, 'rels')
    field('collaborators', item.collaborators, 'rels')
    field('works', item.works, 'rels')
    field('events', item.events, 'rels')
    field('shows', item.shows, 'rels')
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

    cache.main.appendChild(el)
  }
}

function renderTypes (data) {
  var typeDiv
  for (var t in data) {
    typeDiv = document.createElement('a')
    typeDiv.href = '/admin/?q=type:' + t
    typeDiv.appendChild(document.createTextNode(t))
    cache.types.appendChild(typeDiv)
    cache.types.appendChild(document.createTextNode(' '))
  }
}

function logout () {
  var elems = [
    cache.count,
    cache.search,
    cache.main,
    cache.types,
    cache.user
  ]
  elems.forEach(function (elem) {
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem)
    }
  })
  dropCookie('token')
  renderLogin()
}

function renderLogin () {
  if (!cache.login.firstChild) {
    populateLogin()
  }

  if (!cache.login.parentNode) {
    document.body.appendChild(cache.login)
  }
}

function populateLogin () {
  cache.login.appendChild(renderLabel('username'))
  var userInput = renderInput('username', '', 'text')
  cache.login.appendChild(userInput)

  cache.login.appendChild(renderLabel('password'))
  var passInput = renderInput('password')
  cache.login.appendChild(passInput)

  var loginSubmit = document.createElement('input')
  loginSubmit.className = 'submit'
  loginSubmit.type = 'submit'
  loginSubmit.value = 'login'
  cache.login.appendChild(loginSubmit)

  cache.login.addEventListener('submit', function (e) {
    e.preventDefault()
    loginSubmit.disabled = true
    if (cache.errDiv && cache.errDiv.parentNode) cache.login.removeChild(cache.errDiv)
    api('POST', 'login', {username: userInput.value, password: passInput.value}, function (err, user) {
      loginSubmit.disabled = false
      if (err) {
        if (!cache.errDiv) {
          cache.errDiv = document.createElement('div')
          cache.errDiv.className = 'alert'
          cache.errDiv.appendChild(document.createTextNode('No user found with those credentials.'))
        }
        return cache.login.appendChild(cache.errDiv)
      }
      if (cache.errDiv && cache.errDiv.parentNode) cache.login.removeChild(cache.errDiv)
      setCookie('token', user.token, 100)
      setCookie('username', user.name, 100)
      setCookie('userid', user.id, 100)
      cache.login.parentNode.removeChild(cache.login)
      userInput.value = ''
      passInput.value = ''
      renderAll()
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
  cache.search.appendChild(searchInput)
}

function renderCount (total) {
  var totalSpan = document.createElement('span')
  totalSpan.id = 'total'
  totalSpan.appendChild(document.createTextNode(total))
  cache.count.appendChild(totalSpan)
  cache.count.appendChild(document.createTextNode(' results'))
}

function renderUser () {
  if (!cache.user.parentNode) {
    cache.user.firstChild.textContent = getCookie('username')
    cache.user.firstChild.href = getCookie('userid')
    var header = document.getElementsByTagName('header')[0]
    header.insertBefore(cache.user, header.firstChild)
    return
  }

  var nameLink = document.createElement('a')
  nameLink.className = 'username'
  nameLink.href = getCookie('userid')
  nameLink.appendChild(document.createTextNode(getCookie('username')))
  cache.user.appendChild(nameLink)

  cache.user.appendChild(document.createTextNode(' '))

  var logoutLink = document.createElement('a')
  logoutLink.className = 'logout'
  logoutLink.href = ''
  logoutLink.appendChild(document.createTextNode('logout'))
  cache.user.appendChild(logoutLink)

  logoutLink.addEventListener('click', function (e) {
    e.preventDefault()
    logout()
  })
}

function renderAll () {
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
  renderAll()
}

initialize()
