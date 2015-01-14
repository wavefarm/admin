function getParams () {
  return window.location.search.substr(1)
}

function search (params, cb) {
  if (!cb) {
    cb = params
    params = null
  }
  var settings = {
    url: 'http://api.wavefarm.org/search',
    success: cb
  }
  if (params) settings.data = params
  $.ajax(settings)
}

var main = $('#main')
var total = $('#total')
var hits = $('#hits')
var item = $('#item')

search(getParams(), function (data) {
  console.log(data)

  total.text(data.total)

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
  hits.html(hitsInner)
})
