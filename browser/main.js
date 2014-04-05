var api = require('../api')
var h = require('hyperscript')
var page = require('page')
var qs = require('querystring')
var rels = $('.rel');

// SSE reload
require('deva');

var $pageTitle = $('title')
var $q = $('#q')
var $main = $('.main')

page('/', function (ctx) {
  console.log(ctx)
  if (ctx.querystring == $main.data('querystring')) {
    return $('.result').show('slow')
  }
  $main.data('querystring', ctx.querystring)
  var q = qs.parse(ctx.querystring).q
  $q.val(q)
  api.search(q, function (err, results) {
    //console.log(results)
    var count = $('.count')
    if (err) return console.error(err)
    $main.html(h('.count',
      h('span.total', results.total),
      h('span', ' results')
    ))
    var result
    for (var i = 0; i < results.hits.length; i++) {
      result = results.hits[i]
      $main.append(require('../render/result')(result))
    }
  })
})

page('/:id', function (ctx) {
  console.log(ctx)
  if (ctx.state.querystring) {
    // TODO Load results but keep them hidden
  } else {
    // Results already loaded
    ctx.state.querystring = $main.data('querystring')

    // Hide other results
    $('.result').not('#' + id).hide('slow')
  }
  var id = ctx.params.id
  var item = $('#' + id)
})

// Register popstate and click bindings
page()

// Push state on search form submit
$('.search').on('submit', function (e) {
  page('/?q=' + encodeURIComponent($q.val()))
  e.preventDefault()
})

// XXX Idea: Modify limit param in URL as infinite scroll grows

rels.each(function (i, rel) {
  rel = $(rel);
  rel.hide();
  var formField = rel.parent();
  var relItems = rel.val().split('\n').filter(function (line) {
    return line;
  }).map(function (line) {
    return {
      id: line.substr(0, 6),
      main: line.substr(7).trim()
    }
  });
  relItems.forEach(function (item) {
    formField.append('<div class="rel-item"><a href="/'+item.id+'" target="_blank">'+item.main+'</a> <a href="" title="remove">x</a></div>');
  });
  formField.append('<div class="rel-add"><input type="text"> <a href="" title="add">+</a></div>');
});
