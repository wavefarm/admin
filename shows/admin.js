var whiskers = require('lib/whiskers');

function(doc, req) {
  var ddoc = this;

  provides('html', function() {
    var context = {
      req: JSON.stringify(req)
    };
    var partials = {};
    return whiskers.render(ddoc.templates.base, context, partials);
  });
}

