var api = require('../api')
var h = require('hyperscript')
var page = require('page')
var rels = $('.rel');

// SSE reload
require('deva');

var pageTitle = $('title')
var main = $('.main')

page('/', function (ctx) {
  console.log(ctx)
  api.search(null, function (err, results) {
    console.log(results)
    var count = $('.count')
    if (err) return console.error(err)
    // If count already exists just update total
    if (count.length) {
      count.find('.total').html(results.total)
    } else {
      main.html(h('.count', 
        h('span.total', results.total),
        h('span', ' results')
      ))
    }
    var result
    for (var i = 0; i < results.hits.length; i++) {
      result = results.hits[i]
      main.append(require('../render/result')(result))
    }
  })
})

page('/:id', function (ctx) {
  console.log(ctx)
})

// Register popstate and click bindings
page()


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
