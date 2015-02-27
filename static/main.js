/* global setCookie,getCookie,dropCookie,queryString */
'use strict'

var cache = {
  container: document.getElementById('container'),
  head: document.getElementById('head'),
  controls: document.getElementById('controls'),
  main: document.getElementById('main'),
  token: getCookie('token'),
  hits: []
}

cache.typeahead = document.createElement('ul')
cache.typeahead.className = 'typeahead'

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

function renderLabel (name, label) {
  var labelEl = document.createElement('label')
  labelEl.htmlFor = name
  labelEl.appendChild(document.createTextNode(label || name))
  return labelEl
}

function renderInput (name, value, type, required) {
  var input = document.createElement('input')
  input.id = name
  input.name = name
  if (value) input.value = value
  input.type = type || name
  input.required = required
  return input
}

function trunc (str) {
  str = str || ''
  if (str.length > 60) {
    str = str.substr(0, 60) + '...'
  }
  return str
}

function fieldFactory (form, item) {
  return function (name, options) {
    options = options || {}
    var type = 'text'
    var value = item[name]
    var schemaField = cache.schemas[item.type].fields[name]
    if (schemaField) {
      if (schemaField.type === 'boolean') type = 'checkbox'
      else if (schemaField.type === 'text') type = 'textarea'
      else if (schemaField.type) type = schemaField.type
    }
    if (type === 'checkbox') {
      var input = renderInput(name, null, type)
      input.checked = value
      form.appendChild(input)
      var labelEl = renderLabel(name, options.label)
      labelEl.className = 'for-check'
      return form.appendChild(labelEl)
    }
    if (type === 'textarea') {
      form.appendChild(renderLabel(name, options.label))
      var textarea = document.createElement('textarea')
      textarea.id = name
      textarea.name = name
      textarea.textContent = value
      textarea.rows = 10
      textarea.required = options.required
      return form.appendChild(textarea)
    }
    if (type.indexOf('rel') === 0) {
      var relType = type.substr(4)
      form.appendChild(renderLabel(name, options.label))
      var rels = document.createElement('div')
      rels.className = 'rels'
      var relList = document.createElement('ul')
      if (value) value.forEach(function (rel) {
        var relEl = document.createElement('li')
        var relA = document.createElement('a')
        relA.className = 'rel'
        relA.href = rel.id
        relA.target = '_blank'
        relA.textContent = trunc(rel.main)
        relA.dataset.relType = relType
        relA.dataset.relId = rel.id
        relEl.appendChild(relA)
        var relBut = document.createElement('button')
        relBut.className = 'fa fa-unlink'
        relBut.title = 'unlink'
        relEl.appendChild(relBut)
        relList.appendChild(relEl)
      })
      rels.appendChild(relList)
      var relInput = document.createElement('input')
      relInput.type = 'text'
      relInput.autocomplete = 'off'
      rels.appendChild(relInput)
      var relLinkBut = document.createElement('button')
      relLinkBut.className = 'fa fa-link'
      relLinkBut.title = 'link'
      rels.appendChild(relLinkBut)

      relInput.addEventListener('keyup', function (e) {
        e.preventDefault()
        var typed = e.target.value
        if (typed.length < 3) return
        var params = {q: 'type:' + relType + ' main:"' + e.target.value + '"'}
        api('GET', 'search?' + queryString.stringify(params), function (err, data) {
          if (err) console.error(err)
          while (cache.typeahead.firstChild) cache.typeahead.removeChild(cache.typeahead.firstChild)
          rels.appendChild(cache.typeahead)
          data.hits.forEach(function (hit) {
            var hitLi = document.createElement('li')
            hitLi.textContent = hit.main
            cache.typeahead.appendChild(hitLi)
          })
        })
      })

      return form.appendChild(rels)
    }
    form.appendChild(renderLabel(name, options.label))
    form.appendChild(renderInput(name, value, type, options.required))
  }
}

function prepItem () {
  var el = cache.item = document.createElement('a')
  el.className = 'item'

  var publicLink = document.createElement('a')
  el.appendChild(publicLink)
  publicLink.className = 'public'
  publicLink.target = '_blank'
  publicLink.title = 'public location'

  var header = document.createElement('h3')
  el.appendChild(header)
  var main = document.createElement('span')
  header.appendChild(main)
  main.className = 'item-main'
  header.appendChild(document.createTextNode(' '))
  var type = document.createElement('span')
  header.appendChild(type)
  type.className = 'item-type'

  var form = document.createElement('form')
  el.appendChild(form)

  var fields = document.createElement('div')
  fields.id = 'fields'
  form.appendChild(fields)

  var itemActions = document.createElement('div')
  form.appendChild(itemActions)
  itemActions.className = 'actions'
  var itemSave = document.createElement('input')
  itemActions.appendChild(itemSave)
  itemSave.className = 'action'
  itemSave.type = 'submit'
  itemSave.value = 'save'
  var itemDelete = document.createElement('input')
  itemActions.appendChild(itemDelete)
  itemDelete.type = 'button'
  itemDelete.className = 'action delete'
  itemDelete.value = 'delete'

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var item = {id: el.id}
    // console.log(form.elements)
    for (var i = 0; i < form.elements.length; i++) {
      var inputEl = form.elements[i]
      if (inputEl.type === 'checkbox') {
        if (inputEl.checked) item[inputEl.name] = true
      } else if (inputEl.name && inputEl.value) {
        item[inputEl.name] = inputEl.value
      }
    }
    var relAs = form.querySelectorAll('.rel')
    for (i = 0; i < relAs.length; i++) {
      var relA = relAs[i]
      if (!item[relA.dataset.relType]) item[relA.dataset.relType] = []
      item[relA.dataset.relType].push({
        main: relA.textContent,
        id: relA.dataset.relId
      })
    }
    console.log(item)
  })
}

function showItem (item) {
  console.log(item)
  if (!cache.item) prepItem()
  var el = cache.item
  cache.main.appendChild(el)

  el.id = item.id

  var publicLink = el.firstChild
  publicLink.style.display = item.public ? 'block' : 'none'
  var publicUrl = 'wavefarm.org/archive/' + item.id
  publicLink.href = '//' + publicUrl
  publicLink.textContent = publicUrl

  // If no item.main assume we're adding a new item
  var header = el.querySelector('h3')
  var deleteButton = el.querySelector('.delete')
  if (item.main) {
    el.querySelector('.item-main').textContent = item.main
    el.querySelector('.item-type').textContent = item.type
    header.style.display = 'block'
    deleteButton.style.display = 'inline'
  } else {
    header.style.display = 'none'
    deleteButton.style.display = 'none'
  }

  var fields = el.querySelector('#fields')
  while (fields.firstChild) fields.removeChild(fields.firstChild)

  var field = fieldFactory(fields, item)

  if (item.type === 'artist') {
    field('active')
    field('name')
    field('sortName')
    field('bio')
    field('url')
    field('email')
    field('publicEmail', {label: 'public'})
    field('portrait')
    field('portraitCaption')
    field('longDescription')
    field('artists')
    field('works')
    field('shows')
    field('locations')
    field('events')
    field('audio')
    field('video')
    field('image')
    field('text')
  } else if (item.type === 'audio') {
    field('active')
    field('url')
    field('title')
    field('caption')
    field('description')
    field('mimetype')
    field('categories')
    field('date')
    field('sites')
    field('artists')
    field('works')
    field('events')
    field('shows')
  } else if (item.type === 'broadcast') {
    field('public')
    field('title')
    field('start')
    field('end')
    field('genStart')
    field('genEnd')
    field('description')
    field('hosts')
    field('guests')
    field('works')
    field('shows')
    field('locations')
    field('events')
    field('image')
    field('categories')
  } else if (item.type === 'event') {
    field('active')
    field('name')
    field('startDate')
    field('startTime')
    field('endDate')
    field('endTime')
    field('categories')
    field('url')
    field('briefDescription')
    field('longDescription')
    field('artists')
    field('works')
    field('shows')
    field('locations')
    field('events')
    field('image')
    field('broadcastCategories')
    field('hosts')
  } else if (item.type === 'image') {
    field('active')
    field('url')
    field('title')
    field('caption')
    field('description')
    field('mimetype')
    field('categories')
    field('date')
    field('sites')
    field('artists')
    field('works')
    field('events')
    field('shows')
  } else if (item.type === 'location') {
    field('active')
    field('name')
    field('address')
    field('address2')
    field('city')
    field('state')
    field('country')
    field('postalCode')
    field('phone')
    field('url')
  } else if (item.type === 'show') {
    field('public')
    field('nonsort')
    field('title')
    field('subtitle')
    field('credit')
    field('airtime')
    field('description')
    field('start')
    field('end')
    field('hosts')
    field('works')
    field('events')
    field('shows')
  } else if (item.type === 'text') {
    field('active')
    field('url')
    field('title')
    field('credit')
    field('description')
    field('mimetype')
    field('categories')
    field('date')
    field('sites')
    field('artists')
    field('works')
    field('events')
    field('shows')
  } else if (item.type === 'user') {
    field('name', {required: true})
    field('password', {required: true})
    field('email')
    // TODO Show role only if admin?
    field('role')
  } else if (item.type === 'video') {
    field('active')
    field('url')
    field('title')
    field('caption')
    field('description')
    field('mimetype')
    field('categories')
    field('date')
    field('sites')
    field('artists')
    field('works')
    field('events')
    field('shows')
  } else if (item.type === 'work') {
    field('public')
    field('nonsort')
    field('title', {required: true})
    field('subtitle')
    field('date')
    field('description')
    field('url')
    field('categories')
    field('email')
    field('publicEmail', {label: 'public'})
    field('image')
    field('imageCaption', {label: 'image caption'})
    field('audio')
    field('artists')
    field('events')
    field('shows')
    field('works')
  }
}

function prepHit () {
  var el = document.createElement('a')
  el.className = 'item'

  var header = document.createElement('h3')
  var main = document.createElement('span')
  main.className = 'item-main'
  header.appendChild(main)
  header.appendChild(document.createTextNode(' '))
  var type = document.createElement('span')
  type.className = 'item-type'
  header.appendChild(type)
  el.appendChild(header)

  var itemCredit = document.createElement('div')
  itemCredit.className = 'credit'
  el.appendChild(itemCredit)

  var itemDesc = document.createElement('div')
  itemDesc.className = 'description'
  el.appendChild(itemDesc)

  return el
}

function showHits (items) {
  for (var i=0; i < items.length; i++) {
    var item = items[i]
    var desc = item.description || item.briefDescription || item.longDescription || ''

    // Strip HTML tags from description and truncate for excerpt
    desc = desc.replace(/<[^>]*>/g, '')
    desc = desc.length > 60 ? desc.substr(0, 60) + '...' : desc

    var el = cache.hits[i] = cache.hits[i] || prepHit()

    el.id = item.id
    el.href = item.id

    el.querySelector('.item-main').textContent = item.main
    el.querySelector('.item-type').textContent = item.type
    el.querySelector('.credit').textContent = item.credit || ''
    el.querySelector('.description').textContent = desc

    cache.main.appendChild(el)
  }
}

function showTypes () {
  if (!cache.types) {
    cache.types = document.createElement('div')
    cache.types.className = 'types'
  }
  while (cache.types.firstChild) cache.types.removeChild(cache.types.firstChild)
  var typeA
  for (var t in cache.schemas) {
    typeA = document.createElement('a')
    typeA.href = '/admin/?q=type:' + t
    typeA.appendChild(document.createTextNode(t))
    cache.types.appendChild(typeA)
    cache.types.appendChild(document.createTextNode(' '))
  }
  if (!cache.types.parentNode) cache.controls.appendChild(cache.types)
}

function prepLogin () {
  cache.login = document.createElement('form')
  cache.login.className = 'login'

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
      login()
    })
  })
}

function showLogin () {
  if (!cache.login) prepLogin()
  if (!cache.login.parentNode) cache.container.appendChild(cache.login)
}

function logout () {
  var elems = [
    cache.count,
    cache.search,
    cache.types,
    cache.user,
    cache.item,
    cache.newButton
  ]
  elems = elems.concat(cache.hits)
  elems.forEach(function (elem) {
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem)
    }
  })
  dropCookie('token')
  showLogin()
}

function prepSearch () {
  cache.search = document.createElement('form')
  cache.search.className = 'search'
  cache.search.action = '/admin/'

  var searchInput = document.createElement('input')
  searchInput.id = 'q'
  searchInput.name = 'q'
  searchInput.type = 'search'
  searchInput.placeholder = 'search'
  cache.search.appendChild(searchInput)
}

function showSearch (params) {
  if (!cache.search) prepSearch()
  cache.search.elements.q.value = queryString.parse(params).q || ''
  if (!cache.search.parentNode) {
    cache.controls.appendChild(cache.search)
  }
}

function prepCount () {
  cache.count = document.createElement('div')
  cache.count.className = 'count'

  var totalSpan = document.createElement('span')
  cache.count.appendChild(totalSpan)
  cache.count.appendChild(document.createTextNode(' results'))
}

function showCount (total) {
  if (!cache.count) prepCount()
  cache.count.firstChild.textContent = total
  if (!cache.count.parentNode) cache.main.appendChild(cache.count)
}

function prepUser () {
  cache.user = document.createElement('div')
  cache.user.className = 'user'

  var nameLink = document.createElement('a')
  nameLink.className = 'username'
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

function showUser () {
  if (!cache.user) prepUser()
  cache.user.firstChild.textContent = getCookie('username')
  cache.user.firstChild.href = getCookie('userid')
  if (!cache.user.parentNode) {
    cache.head.insertBefore(cache.user, cache.head.firstChild)
  }
}

function prepNewList () {
  cache.newList = document.createElement('ul')
  var a, li
  for (var t in cache.schemas) {
    li = document.createElement('li')
    a = document.createElement('a')
    a.href = '/admin/' + t
    a.textContent = t
    li.appendChild(a)
    cache.newList.appendChild(li)
  }
}

function showNewList () {
  if (!cache.newList) prepNewList()
  cache.newButton.appendChild(cache.newList)
}

function prepNewButton () {
  cache.newButton = document.createElement('div')
  cache.newButton.className = 'actions'
  var newB = document.createElement('a')
  newB.className = 'action'
  newB.href = ''
  newB.textContent = 'new'
  cache.newButton.appendChild(newB)

  newB.addEventListener('click', function (e) {
    e.preventDefault()
    if (cache.newList && cache.newList.parentNode) {
      cache.newButton.removeChild(cache.newList)
    } else {
      showNewList()
    }
  })
}

function showNewButton () {
  if (!cache.newButton) prepNewButton()
  cache.main.appendChild(cache.newButton)
}

function renderPage () {
  var newItemRe = new RegExp('/admin/\(' + Object.keys(cache.schemas).join('|') + '\)')
  var newItem = newItemRe.exec(window.location.pathname)
  var item = /^\/admin\/(\w{6})/.exec(window.location.pathname)
  var params = window.location.search.substr(1)

  if (newItem) {
    return showItem({type: newItem[1]})
  }
  if (item) {
    return api('GET', item[1], function (err, item) {
      if (err) console.error(err)
      showItem(item)
    })
  }
  api('GET', 'search?' + params, function (err, data) {
    if (err) console.error(err)
    showSearch(params)
    showTypes()
    showNewButton()
    showCount(data.total)
    showHits(data.hits)
  })
}

function login () {
  showUser()

  if (!cache.schemas) return api('GET', 'schemas', function (err, data) {
    if (err) console.error(err)
    cache.schemas = data
    renderPage()
  })

  renderPage()
}

function initialize () {
  if (!cache.token) return showLogin()
  login()
}

initialize()
