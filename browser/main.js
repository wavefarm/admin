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
  var $items, $item, item
  var q = qs.parse(ctx.querystring).q
  $q.val(q)
  // If we have a querystring already then we're returning to the list from an item
  if (ctx.querystring == $main.data('querystring')) {
    $count.slideDown('slow')
    $items = $('.item')
    $item = $('#' + $main.data('item-id'))
    $items.slideDown('fast').removeClass('not-selected').one('transitionend', function (e) {
      item = $item.data('item')
      //console.log($item)
      $item.find('form').slideUp('fast', function () {
        $item.html(require('../render/item/link')(item))
      })
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
    $total.html(results.total)
    $main.html('')
    for (var i = 0; i < results.hits.length; i++) {
      result = results.hits[i]
      $item = require('../render/item/wrap')(result)
      $item.appendChild(require('../render/item/link')(result))
      $main.append($item)
    }
  })
})

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

      $item.html(require('../render/item/form')(item))
      $item.find('form').slideDown('fast')

      // Hide other items
      $('.item').not('#'+id).addClass('not-selected').one('transitionend', function (e) {
        $(this).hide('fast')
      })
    }
  } else {
    // No results loaded, need to get item
    $count.slideUp()
    api.get(id, function (err, item) {
      $('title').text(item.main)
      $item = $(require('../render/item/wrap')(item))
      $item.append(require('../render/item/form')(item))
      $main.append($item)
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

// Below are old ideas about handling related items
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
