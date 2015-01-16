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

function initialize () {
  q.value = initialParamsParsed.q || ''

  // Run search on initial page load
  search(initialParams, function (data) {
    console.log(data)

    total.innerHTML = data.total

    var i
    var hit
    var hitLen = data.hits.length
    var hitsInner = ''
    var desc

    for (i=0; i < hitLen; i++) {
      hit = data.hits[i]
      desc = hit.description || hit.briefDescription || hit.longDescription || ''

      // Strip HTML tags from description for excerpt display
      desc = desc.replace(/<[^>]*>/g, '')

      hitsInner = hitsInner
        + '<div class="hit" id="' + hit.id + '">'
        +   '<a href="/' + hit.id + '">'
        +     '<h3><span class="hit-main">' + hit.main + '</span> '
        +       '<span class="hit-type">' + hit.type + '</span>'
        +     '</h3>'
        +     '<div class="credit">' + hit.credit + '</div>'
        +     '<div class="description">'
        +       (desc.length > 60 ? desc.substr(0, 60) + '...' : desc)
        +     '</div>'
        +   '</a>'
        + '</div>'
    }
    hits.innerHTML = hitsInner
  })
}

initialize()
