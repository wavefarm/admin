'use strict'

function getParams () {
  return window.location.search.substr(1)
}

var initialParams = getParams()
var initialParamsParsed = queryString.parse(initialParams)

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

var q = document.getElementById('q')
var main = document.getElementById('main')
var total = document.getElementById('total')
var hits = document.getElementById('hits')
var item = document.getElementById('item')

function populateHits () {
}

function initialize () {
  q.value = initialParamsParsed.q || ''

  // Run search on initial page load
  search(initialParams, function (data) {
    console.log(data)

    total.textContent = total.innerText = data.total

    main.removeChild(hits)

    var desc
    var hit
    var hitCredit
    var hitDesc
    var hitEl
    var hitHeader
    var hitMain
    var hitType
    var hitLen = data.hits.length
    var i
    var wrapperLink

    for (i=0; i < hitLen; i++) {
      hit = data.hits[i]
      desc = hit.description || hit.briefDescription || hit.longDescription || ''

      // Strip HTML tags from description and truncate for excerpt
      desc = desc.replace(/<[^>]*>/g, '')
      desc = desc.length > 60 ? desc.substr(0, 60) + '...' : desc

      hitEl = document.createElement('div')
      hitEl.className = 'hit'
      hitEl.id = hit.id

      wrapperLink = document.createElement('a')
      wrapperLink.href = '/' + hit.id

      hitHeader = document.createElement('h3')
      hitMain = document.createElement('span')
      hitMain.className = 'hit-main'
      hitMain.appendChild(document.createTextNode(hit.main))
      hitHeader.appendChild(hitMain)
      hitHeader.appendChild(document.createTextNode(' '))
      hitType = document.createElement('span')
      hitType.className = 'hit-type'
      hitType.appendChild(document.createTextNode(hit.type))
      hitHeader.appendChild(hitType)
      wrapperLink.appendChild(hitHeader)

      hitCredit = document.createElement('div')
      hitCredit.className = 'credit'
      hitCredit.appendChild(document.createTextNode(hit.credit || ''))
      wrapperLink.appendChild(hitCredit)

      hitDesc = document.createElement('div')
      hitDesc.className = 'description'
      hitDesc.appendChild(document.createTextNode(desc))
      wrapperLink.appendChild(hitDesc)

      hitEl.appendChild(wrapperLink)
      hits.appendChild(hitEl)
    }
    main.appendChild(hits)
  })
}

initialize()
