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

document.addEventListener('keypress', function (e) {
  var t = e.target
  if (t.tagName === 'INPUT' && t.type !== 'search' && e.keyCode === 13) {
    e.preventDefault() // Ignore enter in inputs to avoid form submit
  }
})

function api (method, path, data, cb) {
  if (!cb) {
    cb = data
    data = {}
  }

  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function () {
    if (xhr.readyState !== 4) return
    var data = JSON.parse(xhr.responseText)
    if (xhr.status !== 200) {
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

  form.addEventListener('change', function (e) {
    itemSave.disabled = false
    itemSave.value = 'save'
  })

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var item = {}
    itemSave.disabled = true
    // console.log(form.elements)
    for (var i = 0; i < form.elements.length; i++) {
      var inputEl = form.elements[i]
      if (inputEl.type === 'checkbox') {
        if (inputEl.checked) {
          if (inputEl.dataset.select) {
            var selName = inputEl.dataset.selName
            if (!item[selName]) item[selName] = []
            item[selName].push(inputEl.dataset.option)
          } else item[inputEl.name] = true
        }
      } else if (inputEl.type === 'radio') {
        if (inputEl.checked) {
          item[inputEl.name] = inputEl.value
        }
      } else if (inputEl.name && inputEl.value) {
        item[inputEl.name] = inputEl.value
      }
    }
    var relAs = form.querySelectorAll('.rel')
    for (i = 0; i < relAs.length; i++) {
      var relA = relAs[i]
      var relField = relA.dataset.relField
      if (!item[relField]) item[relField] = []
      item[relField].push({
        main: relA.textContent,
        id: relA.dataset.relId
      })
    }
    // console.log(type.textContent)
    item.type = type.textContent
    item.main = item[cache.schemas[item.type].main]
    console.log(item)
    // If item has an ID we put, otherwise post new item
    if (el.id) {
      item.id = el.id
      api('PUT', el.id, item, function (err) {
        if (err) return console.error(err)
        itemSave.value = 'saved'
        main.textContent = item.main
      })
    } else {
      api('POST', '', item, function (err, savedItem) {
        if (err) return console.error(err)
        console.log(savedItem)
        itemSave.value = 'saved'
        el.id = savedItem.id
        main.textContent = savedItem.main
        itemDelete.style.display = 'inline'
        history.pushState(savedItem, savedItem.main, savedItem.id)
      })
    }
  })
}

function relAdd (rel) {
  var relEl = document.createElement('li')
  var relA = document.createElement('a')
  relA.className = 'rel'
  relA.href = rel.id
  relA.target = '_blank'
  relA.textContent = trunc(rel.main)
  relA.dataset.relId = rel.id
  relA.dataset.relField = rel.field
  relA.dataset.relType = rel.type
  relA.tabIndex = -1
  relEl.appendChild(relA)
  var relBut = document.createElement('button')
  relBut.className = 'fa fa-unlink'
  relBut.title = 'unlink'
  relBut.addEventListener('click', function (e) {
    e.preventDefault()
    rel.list.removeChild(relEl)
  })
  relBut.tabIndex = -1
  relEl.appendChild(relBut)
  rel.list.appendChild(relEl)
}

function showItem (item) {
  console.log(item)
  if (!cache.item) prepItem()
  var el = cache.item
  cache.main.appendChild(el)

  if (item.id) el.id = item.id

  var publicLink = el.firstChild
  publicLink.style.display = item.public ? 'block' : 'none'
  var publicUrl = 'wavefarm.org/archive/' + item.id
  publicLink.href = '//' + publicUrl
  publicLink.textContent = publicUrl

  var header = el.querySelector('h3')
  el.querySelector('.item-main').textContent = item.main
  el.querySelector('.item-type').textContent = item.type

  // If no item.id assume we're adding a new item
  var deleteButton = el.querySelector('.delete')
  if (item.id) {
    deleteButton.style.display = 'inline'
  } else {
    deleteButton.style.display = 'none'
  }

  var fields = el.querySelector('#fields')
  while (fields.firstChild) fields.removeChild(fields.firstChild)

  cache.schemas[item.type].fields.forEach(function (field) {
    var value = item[field.name]
    if (field.type === 'hidden') {
      fields.appendChild(renderInput(field.name, value, 'hidden'))
    } else if (field.type === 'select') {
      fields.appendChild(renderLabel(field.name, field.label))
      field.options.forEach(function (option, i) {
        var id = field.name + i
        var noBreak = document.createElement('div')
        noBreak.style.display = 'inline-block'
        var input = renderInput(field.name, option, 'radio')
        input.id = id
        if (value && value.indexOf(option) !== -1) input.checked = true
        noBreak.appendChild(input)
        var labelEl = renderLabel(id, option)
        labelEl.className = 'for-check'
        noBreak.appendChild(labelEl)
        fields.appendChild(noBreak)
      })
    } else if (field.type === 'select-multiple') {
      fields.appendChild(renderLabel(field.name, field.label))
      field.options.forEach(function (option, i) {
        var id = field.name + i
        var noBreak = document.createElement('div')
        noBreak.style.display = 'inline-block'
        var input = renderInput(id, null, 'checkbox')
        if (value && value.indexOf(option) !== -1) input.checked = true
        input.dataset.select = true
        input.dataset.selName = field.name
        input.dataset.option = option
        noBreak.appendChild(input)
        var labelEl = renderLabel(id, option)
        labelEl.className = 'for-check'
        noBreak.appendChild(labelEl)
        fields.appendChild(noBreak)
      })
    } else if (field.type === 'boolean') {
      var checkboxBox = document.createElement('div')
      checkboxBox.className = 'checkbox-box'
      var input = renderInput(field.name, null, 'checkbox')
      input.checked = value
      checkboxBox.appendChild(input)
      var labelEl = renderLabel(field.name, field.label)
      labelEl.className = 'for-check'
      checkboxBox.appendChild(labelEl)
      fields.appendChild(checkboxBox)
    } else if (field.type === 'text') {
      fields.appendChild(renderLabel(field.name, field.label))
      var textarea = document.createElement('textarea')
      textarea.id = field.name
      textarea.name = field.name
      textarea.textContent = value
      textarea.rows = 10
      textarea.required = field.required
      fields.appendChild(textarea)
    } else if (field.type === 'datetime') {
      fields.appendChild(renderLabel(field.name, field.label))
      var splitDatetime = value.split('T')
      var date = splitDatetime[0]
      var time = splitDatetime[1]
      fields.appendChild(renderInput(field.name + 'Date', date, 'date', field.required))
      fields.appendChild(renderInput(field.name + 'Time', time, 'time', field.required))
    } else if (field.type && field.type.indexOf('rel') === 0) {
      var relType = field.type.substr(4)
      fields.appendChild(renderLabel(field.name, field.label))
      var rels = document.createElement('div')
      rels.className = 'rels'
      var relList = document.createElement('ul')
      if (value) value.forEach(function (rel) {
        rel.field = field.name
        rel.type = relType
        rel.list = relList
        relAdd(rel)
      })
      rels.appendChild(relList)
      var relInput = document.createElement('input')
      relInput.type = 'text'
      relInput.autocomplete = 'off'
      relInput.addEventListener('blur', function (e) {
        if (cache.typeahead.parentNode)
          cache.typeahead.parentNode.removeChild(cache.typeahead)
        relInput.value = ''
      })
      var typeaheadScheduled
      var typeaheadDelay = 500
      var typed
      relInput.addEventListener('keyup', function (e) {
        if (cache.typeahead.parentNode && cache.typeahead.children) {
          var highlighted = cache.typeahead.querySelector('.highlight')
          var newHighlight
          switch (e.keyCode) {
            case 13: // enter
              relAdd({
                id: highlighted.dataset.relId,
                main: highlighted.textContent,
                field: field.name,
                type: relType,
                list: relList
              })
              relInput.value = ''
              cache.typeahead.parentNode.removeChild(cache.typeahead)
              return
            case 38: // up arrow
              newHighlight = highlighted.previousSibling
              if (newHighlight) {
                highlighted.className = ''
                newHighlight.className = 'highlight'
              }
              return
            case 40: // down arrow
              newHighlight = highlighted.nextSibling
              if (newHighlight) {
                highlighted.className = ''
                newHighlight.className = 'highlight'
              }
              return
          }
        }
        typed = e.target.value.trim()
        typeaheadScheduled = Date.now();
        setTimeout(function () {
          var since = Date.now() - typeaheadScheduled
          if (since < typeaheadDelay) return

          if (typed.length < 3) {
            // No API calls for less than 3 characters
            if (cache.typeahead.parentNode)
              cache.typeahead.parentNode.removeChild(cache.typeahead)
            return
          }

          var params = {q: 'type:' + relType + ' main:(' + typed + ')'}
          api('GET', 'search?' + queryString.stringify(params), function (err, data) {
            if (err) return console.error(err)
            while (cache.typeahead.firstChild) cache.typeahead.removeChild(cache.typeahead.firstChild)
            rels.appendChild(cache.typeahead)

            // Drop hits already in the link list
            data.hits = data.hits.filter(function (hit) {
              return !relList.querySelector('[data-rel-id="' + hit.id + '"]')
            })

            data.hits.forEach(function (hit, i) {
              var hitLi = document.createElement('li')
              hitLi.textContent = hit.main
              hitLi.dataset.relId = hit.id
              hitLi.style.cursor = 'pointer'
              if (i === 0) hitLi.className = 'highlight'
              hitLi.addEventListener('click', function () {
                relAdd({
                  id: hit.id,
                  main: hit.main,
                  field: field.name,
                  type: relType,
                  list: relList
                })
                cache.typeahead.parentNode.removeChild(cache.typeahead)
                relInput.value = ''
                relInput.focus()
              })
              hitLi.addEventListener('mouseover', function() {
                var c = cache.typeahead.children
                for (var i = 0; i < c.length; i++) c[i].className = ''
                hitLi.className = 'highlight'
              })
              cache.typeahead.appendChild(hitLi)
            })
          })
        }, typeaheadDelay);
      })
      rels.appendChild(relInput)
      fields.appendChild(rels)
    } else {
      fields.appendChild(renderLabel(field.name, field.label))
      fields.appendChild(renderInput(field.name, value, field.type || 'text', field.required))
    }
  })
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
  for (var i = 0; i < items.length; i++) {
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

var itemRe = /^\/admin\/(\w{6})/

function renderPage (e) {
  if(e && e.state) console.log('state:', e.state)

  if (!cache.newItemRe) {
    cache.newItemRe = new RegExp('/admin/\(' + Object.keys(cache.schemas).join('|') + '\)')
  }

  var newItem = cache.newItemRe.exec(window.location.pathname)
  var item = itemRe.exec(window.location.pathname)
  var params = window.location.search.substr(1)

  if (newItem) {
    return showItem({type: newItem[1]})
  }
  if (item) {
    if (e && e.state && e.state.id) return showItem(e.state)
    return api('GET', item[1], function (err, item) {
      // TODO Display an error message in main content
      if (err) return console.error(err)
      showItem(item)
    })
  }
  api('GET', 'search?' + params, function (err, data) {
    // TODO Display an error message in main content
    if (err) return console.error(err)
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
    if (err) return console.error(err)
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

window.onpopstate = renderPage
