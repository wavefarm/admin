var api = require('../api')
var h = require('hyperscript')
var page = require('page')
var qs = require('querystring')
var rels = $('.rel');

// SSE reload
require('deva');

var $pageTitle = $('title')
var $q = $('#q')
var $count = $('.count')
var $total = $('.total')
var $main = $('.main')

page('/', function (ctx) {
  console.log(ctx)
  var $results, $item
  var q = qs.parse(ctx.querystring).q
  $q.val(q)
  $count.show('slow')
  // If we have a querystring already then we're returning to the list from an item
  if (ctx.querystring == $main.data('querystring')) {
    $results = $('.result')
    $item = $results.not('.not-selected')
    $results.show('slow')
    // Don't wait for the end of show to scroll but give it a head start
    setTimeout(function () {
      $('body').animate({scrollTop: $item.offset().top}, 2000)
    }, 500)
    $results.removeClass('not-selected')
    return
  }
  $main.data('querystring', ctx.querystring)
  api.search(q, function (err, results) {
    //console.log(results)
    if (err) return console.error(err)
    var result
    $total.html(results.total)
    $main.html('')
    for (var i = 0; i < results.hits.length; i++) {
      result = results.hits[i]
      $main.append(require('../render/result')(result))
    }
  })
})

page('/:id', function (ctx) {
  //console.log(ctx)
  var id = ctx.params.id
  var $item = $('#' + id)

  if ($item.length) {
    // Item already in HTML from search
    var item = $item.data('item')
    $q.val('')
    $count.hide('slow')
    if (ctx.state.querystring) {
      // TODO Load results but keep them hidden
    } else {
      // Results already loaded
      ctx.state.querystring = $main.data('querystring')

      // Hide other results
      $('.result').not('#' + id).addClass('not-selected').one('transitionend', function (e) {
        $(this).hide('slow')
        // Note that dynamic requires need to be passed with -r to
        // browserify, and are therefore . rather than ..
        $item.html(require('./render/' + item.type)(item))
      })
    }
  } else {
    // No results loaded, need to get item
    $count.hide()
    api.get(id, function (err, item) {
      $main.html(h('.result', {'id': id},
        require('./render/' + item.type)(item)
      ))
    })
  }
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
