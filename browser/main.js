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
  var $results, $item
  var q = qs.parse(ctx.querystring).q
  $q.val(q)
  // If we have a querystring already then we're returning to the list from an item
  if (ctx.querystring == $main.data('querystring')) {
    $count.slideDown('slow')
    $results = $('.result')
    $item = $('#' + $main.data('item-id'))
    $results.slideDown('fast').removeClass('not-selected').one('transitionend', function (e) {
      console.log($item)
      $item.find('form').slideUp('fast', function () {$(this).remove()})
    })
    // Don't wait for the end of show to scroll but give it a head start
    setTimeout(function () {
      // TODO Save previous scroll position and return to that
      //$('body').animate({scrollTop: $item.offset().top}, 500)
    }, 500)
    return
  }
  $count.show()
  $main.data('querystring', ctx.querystring)
  api.search(q, function (err, results) {
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

// Need map because browserify can't handle dynamic requires
var renderMap = {
  text: require('../render/text'),
}

page('/:id', function (ctx) {
  var id = ctx.params.id
  var $item = $('#' + id)
  $main.data('item-id', id)

  if ($item.length) {
    // Item already in HTML from search
    var item = $item.data('item')
    $('title').text(item.main)
    $q.val('')
    $count.slideUp('slow')
    if (ctx.state.querystring) {
      // TODO Load results but keep them hidden
    } else {
      // Results already loaded
      ctx.state.querystring = $main.data('querystring')

      $item.append(renderMap[item.type](item))
      $item.find('form').slideDown('fast')

      // Hide results
      $('.result').not('#'+id).addClass('not-selected').one('transitionend', function (e) {
        $(this).hide('fast')
      })
    }
  } else {
    // No results loaded, need to get item
    $count.slideUp()
    api.get(id, function (err, item) {
      //$('title').text(item.main)
      $main.html($(require('../render/result')(item)).append(
        renderMap[item.type](item)
      ))
      $('#' + id + ' form').show()
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
