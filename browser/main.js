var api = require('../api')
var page = require('page')
var rels = $('.rel');

// SSE reload
require('deva');

page('/', function (ctx) {
  console.log(ctx)
  api.search(null, function (err, results) {
    if (err) return console.log(err)
    console.log(results)
  })
})

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
