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
  if (t.tagName === 'INPUT' &&
      e.keyCode === 13 &&
      t.parentNode.className !== 'login' &&
      t.type !== 'search' &&
      t.type !== 'submit' &&
      t.type !== 'button') {
    e.preventDefault() // Ignore enter in some inputs to avoid form submit
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
  if (cache.token) {
    xhr.setRequestHeader('Authorization', cache.token)
  }
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
  var itemCopy = document.createElement('input')
  itemActions.appendChild(itemCopy)
  itemCopy.className = 'action no-show-new item-copy'
  itemCopy.type = 'button'
  itemCopy.value = 'copy'
  var itemDelete = document.createElement('input')
  itemActions.appendChild(itemDelete)
  itemDelete.type = 'button'
  itemDelete.className = 'action no-show-new'
  itemDelete.value = 'delete'
  itemDelete.addEventListener('click', function (e) {
    if (window.confirm('Are you sure you want to delete this item?')){
      api('DELETE', el.id, function (err) {
        if (err) return console.error(err)
        window.location = '/admin/'
      })
    }
  })

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    var item = {}
    itemSave.disabled = true
    itemSave.value = 'saving'
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
      } else if (inputEl.type === 'date' && !inputEl.name.indexOf('Dt')) {
        item[inputEl.name.substr(2)] = inputEl.value
      } else if (inputEl.type === 'time' && !inputEl.name.indexOf('dT')) {
        item[inputEl.name.substr(2)] += 'T' + inputEl.value + (
          (inputEl.value.length == 5) ? ':00' : '')
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
    console.log(item)
    // If item has an ID we put, otherwise post new item
    if (el.id) {
      item.id = el.id
      api('PUT', el.id, item, function (err, savedItem) {
        if (err) return console.error(err)
        main.textContent = savedItem.main
        window.location.reload()
      })
    } else {
      api('POST', '', item, function (err, savedItem) {
        if (err) return console.error(err)
        console.log(savedItem)
        el.id = savedItem.id
        main.textContent = savedItem.main
        window.location = '/admin/' + savedItem.id
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
  //console.log(item)
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
  var noShowNew = el.querySelectorAll('.no-show-new')
  if (item.id) {
    for (var i = 0; i < noShowNew.length; i++) {
      noShowNew[i].style.display = 'inline'
    }
  }

  el.querySelector('.item-copy').addEventListener('click', function (e) {
    window.open('/admin/' + item.type + '?copy=' + item.id)
  })
  
  
  if (item.id ) {
    var itemActions = el.querySelector('.actions')

    var itemGenb = document.createElement('input')
	  itemActions.appendChild(itemGenb)
	  itemGenb.className = 'action no-show-new item-genb'
	  itemGenb.type = 'button'
	  itemGenb.value = 'gen broadcasts'
	  itemGenb.style.display='inline'
	  	
  	itemGenb.addEventListener('click', function (e) {
      document.location.href='/admin/genb?id=' + item.id
    })
	  	
	}	  


  var fields = el.querySelector('#fields')
  while (fields.firstChild) fields.removeChild(fields.firstChild)

  var schema = cache.schemas[item.type]
  schema.fields.forEach(function (field) {
    var value = item[field.name]
    if (schema.main === field.name) {
      field.required = true
    }
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
      var splitDatetime = value ? value.split('T') : ['', '']
      var date = splitDatetime[0]
      var time = splitDatetime[1]
      fields.appendChild(renderInput('Dt' + field.name, date, 'date', field.required))
      fields.appendChild(renderInput('dT' + field.name, time, 'time', field.required))
    } else if (field.type && field.type.indexOf('rel') === 0) {
      var relType = field.type.substr(4)
      fields.appendChild(renderLabel(field.name, field.label))
      var rels = document.createElement('div')
      rels.className = 'rels'
      var relList = document.createElement('ul')
      relList.className = 'rel-list'
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
        // RAF to allow for click event on typeahead to happen first
        window.requestAnimationFrame(function () {
          if (cache.typeahead.parentNode)
            cache.typeahead.parentNode.removeChild(cache.typeahead)
          relInput.value = ''
        })
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

function prepGenb() {
	
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
  	
  var itemBack = document.createElement('input')
  itemActions.appendChild(itemBack)
  itemBack.className = 'action item-back-button'
  itemBack.type = 'button'
  itemBack.value = 'back to show'
    	

  var itemTest = document.createElement('input')
  itemActions.appendChild(itemTest)
  itemTest.className = 'action'
  itemTest.type = 'button'
  itemTest.value = 'test'  	
  itemTest.addEventListener('click', function (e) {
  	showGenbResults(true)
  })  	
  	 
  var itemGenerate = document.createElement('input')
  itemActions.appendChild(itemGenerate)
  itemGenerate.className = 'action'
  itemGenerate.type = 'button'
  itemGenerate.value = 'generate'
  itemGenerate.addEventListener('click', function (e) {
    if (window.confirm('Are you sure you want to generate these broadcasts?')){
    	showGenbResults(false)
     }
  })
    
  // results area
  var resultsAreaLabel = document.createElement('h3')
  el.appendChild(resultsAreaLabel)
  resultsAreaLabel.className = 'results-label'
  resultsAreaLabel.innerText = 'Results'
  	
  var resultsAreaUl = document.createElement('ul')
  resultsAreaUl.id = 'resultsAreaUl'
  resultsAreaUl.className = 'results-list'
  el.appendChild(resultsAreaUl)

}

function showGenbResults(test) {
  
	var el = cache.item
	var form = el.querySelector('form')
	var resultsAreaUl = el.querySelector('#resultsAreaUl')
	
	resultsAreaUl.innerText = '';
	
	var item = {}    
  item['id'] = form.elements['id'].value    
  item['startDate'] = form.elements['genbStart'].value
  item['endDate'] = form.elements['genbEnd'].value
  item['test'] = test  
  
  // If item has an ID we put, otherwise post new item
  api('POST', 'genb', item, function (err, broadcasts) {
    if (err) {
    	var li = document.createElement('li')
    	resultsAreaUl.appendChild(li)      	
    	li.innerText =  err.message
    	return console.error(err)
    }
    
    resultsAreaUl.innerText = '';
  	var li = document.createElement('li')
  	resultsAreaUl.appendChild(li)
  	li.innerText = 'total of ' + broadcasts.length + ' broadcasts'
    
    for (var i=0; i<broadcasts.length; i++) {      	
    	var li = document.createElement('li')
    	resultsAreaUl.appendChild(li)
    	var start = new Date(broadcasts[i].start).toUTCString().replace(' GMT','')
    	var end = new Date(broadcasts[i].end).toUTCString().replace(' GMT','')
    	//var start = broadcasts[i].start;
    	//var end = broadcasts[i].end;
    	var desc = broadcasts[i].main + ': ' + start +  ' - ' + end  
    	if (!test) {
      	var a = document.createElement('a')
      	a.innerText = desc
      	a.href = '/admin/'+broadcasts[i].id
      	a.target = '_new'
      	li.appendChild( a )
    	}
    	else {
      	li.innerText = desc     		
    	}
    }      
  })
	
	
}

function showGenb (item) {
	
  if (!cache.item) prepGenb()
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
  
  el.querySelector('.item-back-button').addEventListener('click', function (e) {
  	document.location.href='/admin/'+item.id
  })
  
  fields.appendChild(renderInput('id', item['id'], 'hidden'))
  
  fields.appendChild(renderLabel('airtime', 'airtime (read only)'))
  fields.appendChild(renderInput('airtime', item['airtime'], 'text', 'true'))
  el.querySelector('#airtime').readOnly = true
  
  fields.appendChild(renderLabel('genbAirtime', 'genb airtime (read only)'))
  fields.appendChild(renderInput('genbAirtime', item['genbAirtime'], 'text', 'true'))
  el.querySelector('#genbAirtime').readOnly = true
  
    
  fields.appendChild(renderLabel('genbStart', 'genb start'))
  fields.appendChild(renderInput('genbStart', item['genbStart'], 'date', 'true'))

  fields.appendChild(renderLabel('genbEnd', 'genb end'))
  fields.appendChild(renderInput('genbEnd', item['genbEnd'], 'date', 'true'))
              
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

function showHits (items, from) {
  from = from || 0
  for (var i = 0; i < items.length; i++) {
    var item = items[i]
    var desc = item.description || item.briefDescription || item.longDescription || ''

    // Strip HTML tags from description and truncate for excerpt
    desc = desc.replace(/<[^>]*>/g, '')
    desc = desc.length > 60 ? desc.substr(0, 60) + '...' : desc

    var el = cache.hits[i + from] = cache.hits[i + from] || prepHit()

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
    typeA.href = '/admin/?q=type:' + t + '&sort=-timestamp'
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
      if (user.token) setCookie('token', user.token, 100)
      else console.error('No token for user')
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
  cache.token = null
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

  cache.sortInput = document.createElement('input')
  cache.sortInput.name = 'sort'
  cache.sortInput.type = 'hidden'
}

function showSearch (params) {
  if (!cache.search) prepSearch()
  cache.search.elements.q.value = params.q || ''
  if (!cache.search.parentNode) {
    cache.controls.appendChild(cache.search)
  }
  if (params.sort) {
    cache.sortInput.value = params.sort
    cache.search.appendChild(cache.sortInput)
  } else if (cache.sortInput.parentNode) {
    cache.sortInput.parentNode.removeChild(cache.sortInput)
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

function prepSort () {
  cache.sort = document.createElement('div')
  cache.sort.className = 'sort'

  cache.sort.appendChild(document.createTextNode('Sort by '))
  var relevance = document.createElement('a')
  relevance.textContent = 'relevance'
  cache.sort.appendChild(relevance)
  cache.sort.appendChild(document.createTextNode(' '))
  var timestamp = document.createElement('a')
  timestamp.textContent = 'timestamp'
  cache.sort.appendChild(timestamp)
}

function showSort (params) {
  if (!cache.sort) prepSort()
  var relevance = cache.sort.children[0];
  var timestamp = cache.sort.children[1];
  if (params.sort) {
    relevance.href = '/admin/?' + queryString.stringify({q: params.q})
    timestamp.removeAttribute('href')
  } else {
    relevance.removeAttribute('href')
    timestamp.href = '/admin/?' + queryString.stringify({q: params.q, sort: '-timestamp'})
  }
  if (!cache.sort.parentNode) cache.main.appendChild(cache.sort)
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

function infiniteScroll (data, params) {
  var actingOnScroll, from = 0, size = 30
  window.addEventListener('scroll', function (e) {
    if (actingOnScroll) return
    actingOnScroll = true
    window.requestAnimationFrame(function () {
      if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 100 && data.total > (from + size)) {
        from = from + size;
        api('GET', 'search?' + params + '&from=' + from, function (err, moreData) {
          if (err) return console.error(err)
          showHits(moreData.hits, from)
          actingOnScroll = false
        })
      } else {
        actingOnScroll = false
      }
    })
  })
}

var itemRe = /^\/admin\/(\w{6})/
var genbRe = /^\/admin\/genb\?id=(\w{6})/

function renderPage (e) {
  if (e && e.state) console.log('state:', e.state)

  if (!cache.newItemRe) {
    cache.newItemRe = new RegExp('/admin/(' + Object.keys(cache.schemas).join('|') + ')')
  }

  var newItemMatch = cache.newItemRe.exec(window.location.pathname)
  var itemMatch = itemRe.exec(window.location.pathname)
  var genbMatch = genbRe.exec(window.location.pathname + window.location.search )
  var params = window.location.search.substr(1)
  var paramsParsed = queryString.parse(params)
  
  if (newItemMatch) {
    if (!paramsParsed.copy) return showItem({type: newItemMatch[1]})
    return api('GET', paramsParsed.copy, function (err, item) {
      if (err) return console.error(err)
      delete item.id
      showItem(item)
    })
    
  }
  if (itemMatch) {
    if (e && e.state && e.state.id) return showItem(e.state)
    return api('GET', itemMatch[1], function (err, item) {
      // TODO Display an error message in main content
      if (err) return console.error(err)
      showItem(item)
    })
  }
  if (genbMatch) {
    if (e && e.state && e.state.id) return showGenb(e.state)
    return api('GET', genbMatch[1], function (err, item) {
      // TODO Display an error message in main content
      if (err) return console.error(err)
      showGenb(item)
    })
  }
  api('GET', 'search?' + params + '&size=30', function (err, data) {
    // TODO Display an error message in main content
    if (err) return console.error(err)
    showSearch(paramsParsed)
    showTypes()
    showNewButton()
    showCount(data.total)
    if (paramsParsed.q) showSort(paramsParsed)
    showHits(data.hits)
    infiniteScroll(data, params)
  })
}

function login () {
  showUser()

  if (!cache.schemas) return api('GET', 'schemas', function (err, data) {
    if (err) return logout()
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
